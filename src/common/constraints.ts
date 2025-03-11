import { ThrottleConfig } from './types';

/**
 * Global default options for Throttler.
 * Default set to 5 requests per IP per minute.
 */
export const GLOBAL_THROTTLE_CONFIG: ThrottleConfig = {
  limit: 5,
  ttl: 60,
};

/**
 * Throttle settings for specific auth and verification requests.
 */
export const LOGIN_THROTTLE: ThrottleConfig = { limit: 5, ttl: 60 };
export const ACCOUNT_REQUEST_THROTTLE: ThrottleConfig = { limit: 3, ttl: 60 };
export const PASSWORD_RESET_THROTTLE: ThrottleConfig = { limit: 5, ttl: 60 };
export const EMAIL_VERIFICATION_THROTTLE: ThrottleConfig = {
  limit: 5,
  ttl: 60,
};
export const REFRESH_TOKEN_THROTTLE: ThrottleConfig = { limit: 10, ttl: 60 };
