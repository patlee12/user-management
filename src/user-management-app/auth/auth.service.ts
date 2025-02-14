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

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Login using an email, password, and token if account has MFA enabled. If successful will return JWT token.
   * @param email
   * @param password
   * @param token
   * @returns {AuthResponseDto}
   */
  async login(
    email: string,
    password: string,
    token?: string,
  ): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { email: email } });
    if (!user) {
      throw new NotFoundException(`No user found for that email/password`);
    }

    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('No user found for that email/password');
    }
    let mfaVerified: boolean = false;

    if (user.mfaEnabled) {
      if (token) {
        const userMfa = await this.userService.findOneMfa(user.id);
        const isMfaValid = await this.verifyTotp(userMfa.secret, token);
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
   * Converts base32 secret to a QR code string.
   * @param secret
   * @returns {string}
   */
  async generateQrCode(secret: string): Promise<string> {
    return QRCode.toDataURL(secret);
  }

  /**
   * Verify user token that was provided from their authenticator app.
   * @param encryptedSecret stored encrypted in the mfa_auth table.
   * @param token
   * @returns {boolean}
   */
  async verifyTotp(encryptedSecret: string, token: string): Promise<boolean> {
    const decryptedSecret = await decryptSecret(
      encryptedSecret,
      process.env.MFA_KEY,
    );
    const isValid: boolean = await speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: 'base32',
      token,
      window: 1,
    });
    return isValid;
  }
}
