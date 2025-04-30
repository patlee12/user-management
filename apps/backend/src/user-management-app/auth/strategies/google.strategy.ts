import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { OAuthProvider } from '../constants/oauth-providers.enum';

/**
 * Represents the user payload returned from an OAuth strategy (e.g. Google, Apple).
 * This is injected into `req.user` by Passport during the OAuth flow.
 */
export interface OAuthPayload {
  provider: OAuthProvider;
  providerId: string;
  email: string;
  name?: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  Strategy,
  OAuthProvider.GOOGLE,
) {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const { id, emails, displayName } = profile;

    const user: OAuthPayload = {
      provider: OAuthProvider.GOOGLE,
      providerId: id,
      email: emails?.[0].value.toLowerCase(),
      name: displayName,
    };

    done(null, user);
  }
}
