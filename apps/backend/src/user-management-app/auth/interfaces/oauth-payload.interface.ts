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
