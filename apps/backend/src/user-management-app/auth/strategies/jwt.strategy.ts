import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_SECRET } from '@src/common/constants/environment';
import { UsersService } from 'src/user-management-app/users/users.service';
import { plainToInstance } from 'class-transformer';
import { UserEntity } from '../../users/entities/user.entity';
import { Request } from 'express';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req?.cookies?.access_token || null;
        },
      ]),
      secretOrKey: JWT_SECRET,
      passReqToCallback: true,
    });
  }

  /**
   * Validate JwtPayload. If user is found and MFA (if enabled) is verified, return the UserEntity.
   * @param payload
   * @returns {UserEntity}
   */
  async validate(req: Request, payload: JwtPayload): Promise<UserEntity> {
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
