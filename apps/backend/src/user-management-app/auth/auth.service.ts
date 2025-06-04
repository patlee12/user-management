import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserEntity } from 'src/user-management-app/users/entities/user.entity';
import * as argon2 from 'argon2';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { UsersService } from 'src/user-management-app/users/users.service';
import {
  decryptSecret,
  generateDummyPassword,
} from 'src/helpers/encryption-tools';
import { MfaDto } from './dto/mfa.dto';
import { LoginDto } from './dto/login.dto';
import { MailingService } from '../mailing/mailing.service';
import { EmailMfaDto } from './dto/email-mfa.dto';
import { OAuthPayload } from './interfaces/oauth-payload.interface';
import {
  DOMAIN_HOST,
  AVAHI_HOSTNAME,
  PUBLIC_SESSION_SECRET,
  MFA_KEY,
} from '@src/common/constants/environment';
import { CURRENT_TERMS_VERSION } from '@user-management/shared';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { AcceptTermsDto } from './dto/accepted-terms.dto';

const getIssuer = DOMAIN_HOST || AVAHI_HOSTNAME || 'User-Management';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userService: UsersService,
    private jwtService: JwtService,
    private mailingService: MailingService,
  ) {}

  /**
   * Generates a standardized access token for authenticated access to the api.
   * @param userId The User's ID
   * @param mfaVerified MFA verified?
   * @returns {string} Signed access token
   */
  private generateAccessToken(userId: number, mfaVerified?: boolean): string {
    const jwt: JwtPayload = {
      userId,
      mfaVerified,
      purpose: 'access',
    };
    return this.jwtService.sign(jwt);
  }

  /**
   * Generates a public-session JWT token.
   * @param userId The User's ID
   * @returns {string} Signed session token.
   */
  generatePublicSessionToken(userId: number): string {
    const jwt: JwtPayload = {
      userId: userId,
      purpose: 'session',
    };

    return this.jwtService.sign(jwt, {
      secret: PUBLIC_SESSION_SECRET,
      expiresIn: '30m',
    });
  }

  /**
   * Generates a standardized temp ticket for things like accepting terms after login.
   * @param userId The user ID
   * @returns Signed short-lived JWT ticket
   */
  private generateTempTicket(userId: number, mfaVerified: boolean): string {
    const jwt: JwtPayload = {
      userId,
      mfaVerified,
      purpose: 'temp',
    };
    return this.jwtService.sign(jwt, { expiresIn: '5m' });
  }

  /**
   * Generates a standardized MFA challenge ticket for TOTP verification.
   * @param userId The user ID
   * @returns Signed short-lived JWT ticket
   */
  private generateMfaChallengeTicket(userId: number): string {
    const jwt: JwtPayload = {
      userId: userId,
      purpose: 'mfa-challenge',
    };
    return this.jwtService.sign(jwt, { expiresIn: '5m' });
  }

  /**
   * Authenticates a user with credentials and handles MFA or fallback email MFA if enabled.
   * Also verifies if user has accepted most updated terms of use.
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    let user = null;
    if (loginDto.email?.trim()) {
      user = await this.prisma.user.findUnique({
        where: { email: loginDto.email },
      });
    } else if (loginDto.username?.trim()) {
      user = await this.prisma.user.findUnique({
        where: { username: loginDto.username },
      });
    } else {
      throw new BadRequestException(
        'Either email or username must be provided',
      );
    }

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await argon2.verify(
      user.password,
      loginDto.password,
    );
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid email/password');

    if (user.mfaEnabled) {
      if (loginDto.token) {
        const userMfa = await this.userService.findOneMfa(user.id);
        const isMfaValid = await this.verifyTotp(
          userMfa.secret,
          loginDto.token,
        );
        if (!isMfaValid) throw new UnauthorizedException('Invalid MFA token');

        if (user.termsVersion !== CURRENT_TERMS_VERSION) {
          return {
            termsRequired: true,
            termsVersion: CURRENT_TERMS_VERSION,
            ticket: this.generateTempTicket(user.id, true),
          };
        }

        return {
          accessToken: this.generateAccessToken(user.id, true),
        };
      }
      const ticket = this.generateMfaChallengeTicket(user.id);
      return { mfaRequired: true, ticket };
    }

    const code = this.generateSixDigitCode();
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailMfaTempCode: code,
        emailMfaTempExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });
    await this.mailingService.sendEmailMfaCode({ email: user.email, code });
    return { emailMfaRequired: true, email: user.email };
  }

  /**
   * Handles OAuth login or account creation, and returns an access token or MFA challenge.
   */
  async loginWithOAuth(oauthPayload: OAuthPayload): Promise<AuthResponseDto> {
    const { provider, providerId, email, name } = oauthPayload;
    let oauthAccount = await this.prisma.oAuthAccount.findUnique({
      where: { provider_providerId: { provider, providerId } },
      include: { user: true },
    });

    let user: UserEntity = oauthAccount?.user;
    if (!user) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        throw new BadRequestException(
          'Email already in use by another account.',
        );
      }
      const username = await this.userService.generateUniqueUsername(
        name || email,
        this.prisma,
      );
      user = await this.prisma.user.create({
        data: {
          username,
          name,
          email,
          password: await generateDummyPassword(),
          emailVerified: true,
          loginType: 'oauth',
          OAuthAccount: { create: { provider, providerId, email } },
        },
      });

      await this.prisma.profile.create({
        data: {
          userId: user.id,
          name: user.name || user.username,
        },
      });

      const role = await this.prisma.role.findUnique({
        where: { name: 'User' },
      });
      if (role) {
        await this.prisma.userRoles.create({
          data: { userId: user.id, roleId: role.id, assignedBy: user.id },
        });
      }
    }
    return this.finalizeOAuthLogin(user);
  }

  /**
   * Issues an access token or MFA ticket depending on user settings.
   * Also verifies they have updated terms of use acceptance.
   */
  private finalizeOAuthLogin(user: UserEntity): AuthResponseDto {
    if (user.mfaEnabled) {
      const ticket = this.generateMfaChallengeTicket(user.id);
      return { mfaRequired: true, ticket };
    }

    if (user.termsVersion !== CURRENT_TERMS_VERSION) {
      return {
        termsRequired: true,
        termsVersion: CURRENT_TERMS_VERSION,
        ticket: this.generateTempTicket(user.id, false),
      };
    }

    return {
      accessToken: this.generateAccessToken(user.id, false),
    };
  }

  /**
   * Generates a new base32 MFA secret.
   */
  async generateMfaSecret(user: UserEntity): Promise<string> {
    const secret = await speakeasy.generateSecret({
      name: `${getIssuer} (${user.email})`,
    });
    return secret.base32;
  }

  /**
   * Generates a QR code data URL from the MFA secret.
   */
  async generateQrCode(user: UserEntity, secret: string): Promise<string> {
    const label = `${getIssuer}:${user.email}`;
    const otpAuthUrl = `otpauth://totp/${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(getIssuer)}&algorithm=SHA1&digits=6&period=30`;
    return QRCode.toDataURL(otpAuthUrl);
  }

  /**
   * Verifies an MFA token and enables MFA on the user account.
   * Deletes the `mfa_auth` record if token verification fails.
   */
  async confirmMfa(user: UserEntity, mfaDto: MfaDto): Promise<boolean> {
    const userMfa = await this.userService.findOneMfaByEmail(user.email);
    if (!userMfa) throw new NotFoundException('MFA configuration not found');

    const isValid = await this.verifyTotp(userMfa.secret, mfaDto.token);

    if (!isValid) {
      await this.userService.deleteMfaAuth(userMfa.id);
      throw new UnauthorizedException('Invalid MFA code');
    }

    await this.userService.update(user.id, { mfaEnabled: true });
    return true;
  }

  /**
   * Verifies a TOTP MFA token using the `mfa_ticket`.
   */
  async verifyMfaTicket(mfaDto: MfaDto): Promise<AuthResponseDto> {
    const payload = await this.jwtService.verifyAsync<JwtPayload>(
      mfaDto.ticket,
    );

    if (payload.purpose !== 'mfa-challenge') {
      throw new UnauthorizedException('Invalid MFA ticket');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: Number(payload.userId) },
    });
    if (!user || !user.mfaEnabled) {
      throw new UnauthorizedException('User not eligible for MFA');
    }

    const userMfa = await this.userService.findOneMfa(user.id);
    const isMfaValid = await this.verifyTotp(userMfa.secret, mfaDto.token);
    if (!isMfaValid) throw new UnauthorizedException('Invalid MFA token');

    if (user.termsVersion !== CURRENT_TERMS_VERSION) {
      const ticket = this.generateTempTicket(user.id, true);
      return {
        termsRequired: true,
        termsVersion: CURRENT_TERMS_VERSION,
        ticket,
      };
    }
    return {
      accessToken: this.generateAccessToken(user.id, true),
    };
  }

  /**
   * Verifies a fallback 6-digit email MFA code and returns an access token.
   * Will also return a temp ticket if terms version isn't current.
   */
  async verifyEmailMfaCode(emailMfaDto: EmailMfaDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: emailMfaDto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (
      !user.emailMfaTempCode ||
      !user.emailMfaTempExpiresAt ||
      user.emailMfaTempExpiresAt < new Date()
    ) {
      throw new UnauthorizedException('MFA code expired or missing');
    }

    if (user.emailMfaTempCode !== emailMfaDto.token) {
      throw new UnauthorizedException('Invalid MFA code');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailMfaTempCode: null, emailMfaTempExpiresAt: null },
    });

    if (user.termsVersion !== CURRENT_TERMS_VERSION) {
      const ticket = this.generateTempTicket(user.id, false);
      return {
        termsRequired: true,
        termsVersion: CURRENT_TERMS_VERSION,
        ticket,
      };
    }

    return {
      accessToken: this.generateAccessToken(user.id, true),
    };
  }

  /**
   * Verifies a TOTP token using a decrypted MFA secret.
   */
  async verifyTotp(encryptedSecret: string, token: string): Promise<boolean> {
    const decryptedSecret = await decryptSecret(encryptedSecret, MFA_KEY);
    return speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: 'base32',
      token,
      window: 1,
    });
  }

  /**
   * Generates a 6-digit numeric code as a string.
   */
  private generateSixDigitCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Updates the user's accepted terms version using a valid temp token
   * and returns a new access token for the session.
   * @param dto The accept terms DTO
   * @returns {AuthResponseDto}
   */
  async acceptTerms(dto: AcceptTermsDto): Promise<AuthResponseDto> {
    if (!dto.accepted) {
      throw new BadRequestException('Terms must be explicitly accepted');
    }
    const payload = await this.jwtService.verifyAsync<JwtPayload>(dto.ticket);

    if (payload.purpose !== 'temp') {
      throw new UnauthorizedException('Invalid temp token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) throw new UnauthorizedException('User not found');

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        termsVersion: CURRENT_TERMS_VERSION,
        acceptedTermsAt: new Date(),
      },
    });

    return {
      accessToken: this.generateAccessToken(user.id, payload.mfaVerified),
    };
  }
}
