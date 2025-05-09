import { DOMAIN_HOST } from '@src/common/constants/environment';
import { CookieOptions } from 'express';

/**
 * Returns cookie options that behave correctly in both development and production.
 *
 * In development:
 * - `secure: false`
 * - `sameSite` is omitted entirely (for redirect compatibility on localhost)
 * - `domain` is omitted to avoid `.localhost` rejection
 *
 * In production:
 * - `secure: true`
 * - `sameSite: 'none'` for cross-origin compatibility (required for third-party cookies)
 * - `domain` is set from `DOMAIN_HOST` (e.g., `.yourdomain.com`)
 *
 * For clearing cookies:
 * - `maxAge` is omitted to comply with Express 5.x deprecation warnings
 * - All other options are preserved (httpOnly, secure, domain, etc.)
 *
 * @param isHttpOnly - `true` for private cookies (e.g., `access_token`), `false` for public ones (e.g., `public_session`)
 * @param isProd - `true` if running in production environment
 * @param forClear - `true` if used with `res.clearCookie` (omit `maxAge`)
 * @returns A `CookieOptions` object suitable for use in `res.cookie()` or `res.clearCookie()`
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

  if (!forClear) {
    options.maxAge = 1000 * 60 * 30; // 30 minutes
  }

  if (isProd) {
    options.sameSite = 'none';
    if (DOMAIN_HOST?.trim()) {
      options.domain = `.${DOMAIN_HOST.trim()}`;
    }
  }

  return options;
}

export default getCookieOptions;
