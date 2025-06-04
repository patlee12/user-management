/**
 * Represents a payload for the JWT strategy.
 */
export interface JwtPayload {
  userId: number;
  mfaVerified?: boolean;
  purpose: 'access' | 'session' | 'temp' | 'mfa-challenge';
  iat?: number;
  exp?: number;
}
