/**
 * Represents the payload for the JWT strategy.
 */
export interface JwtPayload {
  userId: number;
  mfaVerified: boolean;
  iat?: number;
  exp?: number;
}
