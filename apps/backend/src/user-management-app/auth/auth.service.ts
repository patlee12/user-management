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
import { JwtPayload } from './jwt.strategy';
import { decryptSecret } from 'src/helpers/encryption-tools';
import { MfaDto } from './dto/mfa.dto';
import { LoginDto } from './dto/login.dto';
import { MailingService } from '../mailing/mailing.service';

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
   * - If the user does **not** have MFA enabled, returns a JWT access token.
   * - If the user **has MFA enabled**:
   *   - and provides a valid MFA token, returns a JWT access token.
   *   - and does **not** provide an MFA token, returns an MFA challenge response containing a short-lived ticket.
   *
   * This supports a two-step MFA flow where the frontend receives a `ticket` from the login response and completes MFA verification via `/auth/verify-mfa`.
   *
   * @param loginDto - The login data containing email or username, password, and optionally an MFA token.
   * @returns {AuthResponseDto} - Either an access token, or an MFA challenge ticket.
   *
   * @throws {NotFoundException} - If no user is found for the provided email.
   * @throws {UnauthorizedException} - If the password is invalid or if an invalid MFA token is provided.
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

    // Instead of immediately returning accessToken,
    // return a response telling frontend "email verification required"
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
