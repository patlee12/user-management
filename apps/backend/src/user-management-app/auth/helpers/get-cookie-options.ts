import { DOMAIN_HOST } from '@src/common/constants/environment';
import { CookieOptions } from 'express';

/**
 * Returns cookie options that behave correctly in both development and production.
 *
 * In development:
 * - `secure: false`
 * - `sameSite` omitted
 * - `domain` omitted
 *
 * In production:
 * - `secure: true`
 * - `sameSite: 'none'`
 * - `domain: .yourdomain.com` (based on DOMAIN_HOST)
 *
 * If `forClear` is true:
 * - `expires` is set instead of `maxAge`
 * - BUT sameSite and domain are still included to match the original cookie
 */
function getCookieOptions(
  isHttpOnly: boolean,
  isProd: boolean,
  forClear = false,
): CookieOptions {
  const options: CookieOptions = {
    httpOnly: isHttpOnly,
    secure: isProd,
    path: '/',
  };

  // Ensure proper clearing
  if (forClear) {
    options.expires = new Date(0);
  } else {
    options.maxAge = 1000 * 60 * 30; // 30 minutes
  }

  // Only apply sameSite and domain in production (for both set and clear)
  if (isProd) {
    options.sameSite = 'none';
    if (DOMAIN_HOST?.trim()) {
      options.domain = `.${DOMAIN_HOST.trim()}`;
    }
  }

  return options;
}

export default getCookieOptions;
