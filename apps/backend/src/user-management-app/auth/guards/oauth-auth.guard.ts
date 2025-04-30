import { AuthGuard } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

export function createOAuthGuard(strategyName: string) {
  @Injectable()
  class OAuthAuthGuard extends AuthGuard(strategyName) {
    handleRequest(err: any, user: any, info: any) {
      if (err || !user) {
        console.error(`${strategyName} Auth Error:`, err, info);
        throw new UnauthorizedException('Unauthorized');
      }
      return user;
    }
  }

  Object.defineProperty(OAuthAuthGuard, 'name', {
    value: `${strategyName.charAt(0).toUpperCase() + strategyName.slice(1)}AuthGuard`,
  });

  return OAuthAuthGuard;
}
