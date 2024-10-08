import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthEntity } from './entity/auth.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { UsersService } from 'src/users/users.service';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(
    email: string,
    password: string,
    token?: string,
  ): Promise<AuthEntity> {
    // Fetch a user
    const user = await this.prisma.user.findUnique({ where: { email: email } });

    // If no user is found.
    if (!user) {
      throw new NotFoundException(`No user found for the email ${email}`);
    }

    // Check if the password is correct.
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // If password does not match.
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Invalid password was provided, please try again.',
      );
    }
    let mfaVerified: boolean = false;
    if (token) {
      const userMfa = await this.userService.findOneMfa(user.id);

      if (userMfa.enabled) {
        const isMfaValid = this.verifyTotp(userMfa.secret, token);
        if (isMfaValid) {
          mfaVerified = true;
        } else {
          throw new UnauthorizedException('Invalid MFA token');
        }
      }
    }

    const jwtPayload: JwtPayload = {
      email: user.email,
      mfaVerified: mfaVerified,
    };
    // Generate a JWT.
    return {
      accessToken: this.jwtService.sign(jwtPayload),
    };
  }

  async generateMfaSecret(user: UserEntity): Promise<string> {
    const secret = await speakeasy.generateSecret({
      name: `User Management (${user.email})`,
    });
    return secret.base32;
  }

  async generateQrCode(secret: string): Promise<string> {
    return QRCode.toDataURL(secret);
  }

  verifyTotp(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1, // Increase window if needed to handle timing issues
    });
  }
}
