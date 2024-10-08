import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtSecret } from './auth.module';
import { UsersService } from 'src/users/users.service';

export interface JwtPayload {
  email: string;
  mfaVerified: boolean;
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
    const user = await this.usersService.findOneByEmail(payload.email);
    const userMfa = await this.usersService.findOneMfa(user.id);

    if (!user) {
      throw new UnauthorizedException();
    }
    if (userMfa.enabled && !payload.mfaVerified) {
      throw new UnauthorizedException('MFA verification required');
    }

    return user;
  }
}
