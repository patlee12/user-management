import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
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

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Authenticates a user with their email, password, and (if MFA is enabled) a multi-factor authentication (MFA) token.
   * If successful, a JWT access token is returned.
   * If any of the validation steps fail, an appropriate exception is thrown:
   * - `NotFoundException` if the email does not match any user in the database.
   * - `UnauthorizedException` if the password or MFA token is invalid, or if MFA is enabled but the token is not provided.
   * @param email - The user's email address.
   * @param password - The user's password.
   * @param token - The optional MFA token (only required if MFA is enabled).
   * @returns {AuthResponseDto} - The JWT access token.
   * @throws {NotFoundException} - If no user is found for the provided email.
   * @throws {UnauthorizedException} - If the password is invalid, MFA is required but no token is provided, or if the provided MFA token is invalid.
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });
    if (!user) {
      throw new NotFoundException(`No user found for that email/password`);
    }

    const isPasswordValid = await argon2.verify(
      user.password,
      loginDto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('No user found for that email/password');
    }
    let mfaVerified: boolean = false;

    if (user.mfaEnabled) {
      if (loginDto.token) {
        const userMfa = await this.userService.findOneMfa(user.id);
        const isMfaValid = await this.verifyTotp(
          userMfa.secret,
          loginDto.token,
        );
        if (isMfaValid) {
          mfaVerified = true;
        } else {
          throw new UnauthorizedException('Invalid MFA token');
        }
      } else {
        throw new UnauthorizedException(
          'MFA is enabled for this account. You must provide the MFA token with login.',
        );
      }
    }

    const jwtPayload: JwtPayload = {
      userId: user.id,
      mfaVerified: mfaVerified,
    };
    return { accessToken: this.jwtService.sign(jwtPayload) };
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
   * Converts secret to a QR code string.
   * @param secret base32 secret
   * @returns {string}
   */
  async generateQrCode(secret: string): Promise<string> {
    return QRCode.toDataURL(secret);
  }

  /**
   * Verify user's MFA token and enable Mfa on the user's account.
   * @param user - UserEntity
   * @param mfaDto - Mfa dto with 6 digit token.
   * @returns {boolean}
   */
  async verifyMfa(user: UserEntity, mfaDto: MfaDto): Promise<boolean> {
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
