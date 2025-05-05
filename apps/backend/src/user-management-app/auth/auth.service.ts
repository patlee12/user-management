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
import { JwtPayload } from './interfaces/jwt-payload.interface';
import {
  decryptSecret,
  generateDummyPassword,
} from 'src/helpers/encryption-tools';
import { MfaDto } from './dto/mfa.dto';
import { LoginDto } from './dto/login.dto';
import { MailingService } from '../mailing/mailing.service';
import { EmailMfaDto } from './dto/email-mfa.dto';
import { OAuthPayload } from './interfaces/oauth-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userService: UsersService,
    private jwtService: JwtService,
    private mailingService: MailingService,
  ) {}

  /**
   * Authenticates a user with their provided email or username and password.
   *
   * Depending on the user's MFA status, the login behavior adjusts as follows:
   *
   * - If the user **has TOTP MFA enabled**:
   *   - and provides a valid MFA token immediately, returns a JWT access token.
   *   - and does **not** provide an MFA token, returns an MFA challenge ticket.
   *
   * - If the user **does not have TOTP MFA enabled**:
   *   - generates a 6-digit MFA code,
   *   - sends it to the user's email,
   *   - and returns an email MFA challenge response (`emailMfaRequired: true`).
   *
   * This flow ensures:
   * - Two-step login with MFA ticket verification (for TOTP users)
   * - Email-based MFA fallback for all other users
   *
   * @param loginDto - The login data containing email or username, password, and optionally an MFA token.
   * @returns {AuthResponseDto} - Either a final access token, an MFA challenge ticket, or an email MFA challenge.
   *
   * @throws {BadRequestException} - If neither email nor username is provided.
   * @throws {UnauthorizedException} - If invalid credentials or invalid MFA token are provided.
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    let user = null;
    if (loginDto.email && loginDto.email.trim() !== '') {
      user = await this.prisma.user.findUnique({
        where: { email: loginDto.email },
      });
    } else if (loginDto.username && loginDto.username.trim() !== '') {
      user = await this.prisma.user.findUnique({
        where: { username: loginDto.username },
      });
    } else {
      throw new BadRequestException(
        'Either email or username must be provided',
      );
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await argon2.verify(
      user.password,
      loginDto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('No user found for that email/password');
    }

    // MFA handling
    if (user.mfaEnabled) {
      if (loginDto.token) {
        const userMfa = await this.userService.findOneMfa(user.id);
        const isMfaValid = await this.verifyTotp(
          userMfa.secret,
          loginDto.token,
        );

        if (!isMfaValid) {
          throw new UnauthorizedException('Invalid MFA token');
        }

        const jwtPayload: JwtPayload = {
          userId: user.id,
          mfaVerified: true,
        };

        return {
          accessToken: this.jwtService.sign(jwtPayload),
        };
      }

      // No token provided — issue MFA challenge ticket
      const ticket = this.jwtService.sign(
        {
          userId: user.id,
          purpose: 'mfa-challenge',
        },
        { expiresIn: '5m' },
      );

      return {
        mfaRequired: true,
        ticket,
      };
    }

    // No MFA enabled — fallback to email MFA
    const code = this.generateSixDigitCode();

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailMfaTempCode: code,
        emailMfaTempExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // Send the MFA code by email
    await this.mailingService.sendEmailMfaCode({ email: user.email, code });

    return {
      emailMfaRequired: true,
      userId: user.id,
    };
  }

  /**
   * Generates a random 6-digit numerical code as a string.
   *
   * This is used for email-based MFA fallback during the login process,
   * providing a simple, time-sensitive second factor for users
   * who have not enabled full TOTP multi-factor authentication.
   *
   * @returns {string} A six-digit string.
   */
  generateSixDigitCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Handles login or account creation via an OAuth provider (e.g. Google, Apple).
   *
   * If the user has previously connected this OAuth provider (`providerId`), it returns
   * the associated user and initiates the appropriate login flow.
   *
   * If no OAuth account exists:
   * - A new user is created with the given email/name.
   * - The OAuth account is linked to that user.
   * - If an existing user with that email already exists, the login is rejected.
   *
   * @param oauthPayload - The profile data returned from the OAuth strategy.
   * @returns A login response, which may include an access token or MFA challenge ticket.
   *
   * @throws BadRequestException - If an existing user already uses the same email.
   */
  async loginWithOAuth(oauthPayload: OAuthPayload): Promise<AuthResponseDto> {
    const { provider, providerId, email, name } = oauthPayload;

    let oauthAccount = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId,
        },
      },
      include: { user: true },
    });

    let user = oauthAccount?.user;

    if (!user) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new BadRequestException(
          'An account already exists with this email. Please log in with your original method.',
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
          password: await generateDummyPassword(), // A placeholder password for the OAuth Account
          emailVerified: true,
          loginType: 'oauth',
          OAuthAccount: {
            create: {
              provider,
              providerId,
              email,
            },
          },
        },
      });
    }

    return this.finalizeOAuthLogin(user);
  }

  /**
   * Issues either a short-lived MFA challenge ticket or a JWT access token.
   *
   * This is used during OAuth or standard login to centralize MFA handling.
   *
   * @param user - The user attempting to log in.
   * @returns A challenge ticket if MFA is enabled, or an access token otherwise.
   */
  private finalizeOAuthLogin(user: UserEntity): AuthResponseDto {
    if (user.mfaEnabled) {
      const ticket = this.jwtService.sign(
        { userId: user.id, purpose: 'mfa-challenge' },
        { expiresIn: '5m' },
      );
      return { mfaRequired: true, ticket };
    }

    return {
      accessToken: this.jwtService.sign({
        userId: user.id,
        mfaVerified: false,
      }),
    };
  }

  /**
   * Generates a public session token (JWT) with minimal info.
   * This token is used by Next.js middleware for route protection.
   *
   * @param userId - The authenticated user's ID.
   * @returns A signed JWT string.
   */
  generatePublicSessionToken(userId: number): string {
    const payload = { userId, publicSession: true };
    return this.jwtService.sign(payload, {
      secret: process.env.PUBLIC_SESSION_SECRET,
      expiresIn: '30m',
    });
  }

  /**
   * This function generates a MFA secret base32.
   * @param user A user entity.
   * @returns {string}
   */
  async generateMfaSecret(user: UserEntity): Promise<string> {
    const secret = await speakeasy.generateSecret({
      name: `User Management (${user.email})`,
    });
    return secret.base32;
  }

  /**
   * Converts a secret to a QR code string by generating a valid OTP Auth URL.
   * The URL is formatted for TOTP with parameters expected by authenticator apps.
   *
   * @param secret Base32-encoded secret.
   * @param userEmail The user's email address used to label the OTP entry.
   * @returns {Promise<string>} A data URL containing the generated QR code.
   */
  async generateQrCode(user: UserEntity, secret: string): Promise<string> {
    const issuer = process.env.AVAHI_HOSTNAME || 'User-Management'; // Replace with your actual issuer name
    const label = `${issuer}:${user.email}`;
    const otpAuthUrl = `otpauth://totp/${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
    return await QRCode.toDataURL(otpAuthUrl);
  }

  /**
   * Verify user's MFA token and enable Mfa on the user's account.
   * @param user - UserEntity
   * @param mfaDto - Mfa dto with 6 digit token.
   * @returns {boolean}
   */
  async confirmMfa(user: UserEntity, mfaDto: MfaDto): Promise<boolean> {
    const userMfa = await this.userService.findOneMfaByEmail(user.email);
    if (!userMfa) {
      throw new NotFoundException('MFA configuration not found for user');
    }

    const isValid = await this.verifyTotp(userMfa.secret, mfaDto.token);

    if (!isValid) {
      throw new UnauthorizedException('Invalid MFA code');
    }

    await this.userService.update(user.id, { mfaEnabled: true });

    return true;
  }

  /**
   * Verifies a user's MFA token using a short-lived ticket issued during login.
   *
   * This method is called after a successful email/password login when MFA is enabled,
   * but no token was initially provided. The client submits the 6-digit MFA token along
   * with the ticket received from the login response.
   *
   * If the ticket and token are valid, an access token is issued.
   *
   * @param mfaDto - Contains the MFA token and the temporary ticket from login.
   * @returns {AuthResponseDto} - JWT access token if the MFA challenge is successful.
   *
   * @throws {UnauthorizedException} - If the ticket is invalid, expired, not for MFA,
   *                                   the user is ineligible, or the MFA token is invalid.
   */
  async verifyMfaTicket(mfaDto: MfaDto): Promise<AuthResponseDto> {
    const payload = await this.jwtService.verifyAsync<{
      userId: number | string;
      purpose: string;
    }>(mfaDto.ticket);

    if (payload.purpose !== 'mfa-challenge') {
      throw new UnauthorizedException('Invalid MFA ticket');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: Number(payload.userId) },
    });

    if (!user || !user.mfaEnabled) {
      throw new UnauthorizedException('User not eligible for MFA challenge');
    }

    const userMfa = await this.userService.findOneMfa(user.id);
    const isMfaValid = await this.verifyTotp(userMfa.secret, mfaDto.token);

    if (!isMfaValid) {
      throw new UnauthorizedException('Invalid MFA token');
    }

    const accessToken = this.jwtService.sign({
      userId: user.id,
      mfaVerified: true,
    });

    return { accessToken };
  }

  /**
   * Verifies a user's email-based 6-digit MFA code during login fallback.
   *
   * This is called after the user logs in with email/password and receives
   * an emailed 6-digit code because they don't have full MFA enabled.
   *
   * If the code matches and is not expired, an access token is issued.
   *
   * @param emailMfaDto -  Data transfer object with user's email address and a token represented by 6-digit code.
   * @returns {AuthResponseDto} - JWT access token if the email MFA verification is successful.
   * @throws {UnauthorizedException} - If the code is invalid, expired, or no user is found.
   */
  async verifyEmailMfaCode(emailMfaDto: EmailMfaDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: emailMfaDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.emailMfaTempCode || !user.emailMfaTempExpiresAt) {
      throw new UnauthorizedException('No MFA code found for this user');
    }

    const now = new Date();

    if (user.emailMfaTempExpiresAt < now) {
      throw new UnauthorizedException('MFA code has expired');
    }

    if (user.emailMfaTempCode !== emailMfaDto.token) {
      throw new UnauthorizedException('Invalid MFA code');
    }

    // Clear the temp MFA code after successful verification
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailMfaTempCode: null,
        emailMfaTempExpiresAt: null,
      },
    });

    const accessToken = this.jwtService.sign({
      userId: user.id,
      mfaVerified: true,
    });

    return { accessToken };
  }

  /**
   * Verify user token that was provided from their authenticator app.
   * @param encryptedSecret - stored encrypted in the mfa_auth table.
   * @param token - 6 digit token from MfaDto.
   * @returns {boolean}
   */
  async verifyTotp(encryptedSecret: string, token: string): Promise<boolean> {
    const decryptedSecret = await decryptSecret(
      encryptedSecret,
      process.env.MFA_KEY,
    );
    return speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: 'base32',
      token,
      window: 1,
    });
  }
}
