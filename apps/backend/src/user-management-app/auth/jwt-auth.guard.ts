import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  //   canActivate(context: ExecutionContext) {
  //     const request = context.switchToHttp().getRequest();
  //     console.log('Authorization Header:', request.headers.authorization);
  //     return super.canActivate(context);
  //   }

  handleRequest(err, user, info) {
    if (err || !user) {
      console.error('JWT Auth Error:', err, info);
      throw new UnauthorizedException('Unauthorized');
    }
    return user;
  }
}
