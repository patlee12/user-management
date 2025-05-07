import { AuthGuard } from '@nestjs/passport';
import {
  Injectable,
  UnauthorizedException,
  ExecutionContext,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';

export function createOAuthGuard(strategyName: string) {
  @Injectable()
  class OAuthAuthGuard extends AuthGuard(strategyName) {
    /**
     * Called when initiating the OAuth flow.
     * Takes our own ?redirect=… query and stuffs it into state.
     */
    getAuthenticateOptions(context: ExecutionContext) {
      const req = context.switchToHttp().getRequest<ExpressRequest>();
      const raw = req.query.redirect;
      const redirect = Array.isArray(raw)
        ? raw[0]
        : typeof raw === 'string'
          ? raw
          : '/';

      return {
        state: JSON.stringify({ redirect }),
      };
    }

    /**
     * Called on the callback phase.
     * If something went wrong, throw an UnauthorizedException.
     */
    handleRequest(err: any, user: any, info: any) {
      if (err || !user) {
        console.error(`${strategyName} Auth Error:`, err || info);
        throw new UnauthorizedException('Unauthorized');
      }
      return user;
    }
  }

  // Give the class a nice name for stack traces, etc.
  Object.defineProperty(OAuthAuthGuard, 'name', {
    value:
      strategyName.charAt(0).toUpperCase() +
      strategyName.slice(1) +
      'AuthGuard',
  });

  return OAuthAuthGuard;
}
