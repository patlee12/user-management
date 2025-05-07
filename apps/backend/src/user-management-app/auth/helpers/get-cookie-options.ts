import { CookieOptions } from 'express';

/**
 * Returns cookie options that behave correctly in both development and production.
 *
 * In development:
 * - `secure: false`
 * - `sameSite` is omitted entirely (required for redirect compatibility on localhost)
 * - `domain` is omitted to avoid `.localhost` rejection
 *
 * In production:
 * - `secure: true`
 * - `sameSite: 'none'` for cross-origin compatibility
 * - `domain` is set from `DOMAIN_HOST` (e.g. `.yourdomain.com`)
 *
 * @param isHttpOnly - `true` for `access_token`, `false` for public cookies like `public_session`
 */
function getCookieOptions(isHttpOnly: boolean, isProd: boolean): CookieOptions {
  const options: CookieOptions = {
    httpOnly: isHttpOnly,
    secure: isProd,
    path: '/',
    maxAge: 1000 * 60 * 30, // 30 minutes
  };

  if (isProd) {
    options.sameSite = 'none';
    if (process.env.DOMAIN_HOST?.trim()) {
      options.domain = `.${process.env.DOMAIN_HOST.trim()}`;
    }
  }

  return options;
}

export default getCookieOptions;
