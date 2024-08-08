import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthEntity } from './entity/auth.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<AuthEntity> {
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

    // Generate a JWT.
    return {
      accessToken: this.jwtService.sign({ userId: user.id }),
    };
  }
}
