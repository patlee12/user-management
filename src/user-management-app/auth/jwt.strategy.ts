import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtSecret } from './auth.module';
import { UsersService } from 'src/user-management-app/users/users.service';
import { plainToInstance } from 'class-transformer';
import { UserEntity } from '../users/entities/user.entity';
export interface JwtPayload {
  userId: number;
  mfaVerified: boolean;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findOne(payload.userId);

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    if (!payload.mfaVerified && user.mfaEnabled) {
      throw new UnauthorizedException('MFA verification required');
    }

    return plainToInstance(UserEntity, user);
  }
}
