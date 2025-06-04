import axiosInstance from '@/lib/axiosInstance';
import {
  AuthResponseDto,
  EmailMfaDto,
  LoginDto,
  MfaDto,
  MfaResponseDto,
  AcceptTermsDto,
} from '@user-management/types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

/**
 * Sends a login POST request to the backend `/auth/login` using email and password.
 * If MFA is enabled on the account, the response will include a temporary `ticket`
 * and `mfaRequired: true` instead of an access token.
 *
 * @param loginDto - The login data (email/username and password).
 * @returns {Promise<AuthResponseDto>} A promise resolving to either an access token or MFA challenge response.
 */
export async function login(loginDto: LoginDto): Promise<AuthResponseDto> {
  const res = await axiosInstance.post<AuthResponseDto>(
    '/auth/login',
    loginDto,
  );
  return res.data;
}

/**
 * Only allow simple relative URLs.
 */
function sanitizeRedirect(path: string): string {
  // must start with a single slash, no “//”
  if (/^\/(?!\/)/.test(path)) {
    return path;
  }
  return '/';
}

/**
 * Starts Google OAuth by redirecting the browser
 * to our backend’s `/auth/google` endpoint.
 *
 * @param opts.redirect - Path to return to after OAuth completes.
 */
export function oauthLogin(opts: { redirect: string }): void {
  const safe = sanitizeRedirect(opts.redirect);
  const url = `${BACKEND_URL}/auth/google?redirect=${encodeURIComponent(safe)}`;
  window.location.href = url;
}

/**
 * Submits POST request to `/auth/verify-mfa` with a 6-digit MFA token along with a temporary ticket
 * to complete the authentication process after login.
 *
 * @param mfaDto - The MFA token and ticket from the previous login step.
 * @returns {Promise<AuthResponseDto>} A promise resolving to an access token or temp token for terms.
 */
export async function verifyMfa(mfaDto: MfaDto): Promise<AuthResponseDto> {
  const res = await axiosInstance.post<AuthResponseDto>(
    '/auth/verify-mfa',
    mfaDto,
    {
      headers: {
        Authorization: `Bearer ${mfaDto.ticket}`,
      },
    },
  );
  return res.data;
}

/**
 * Submits POST request to `/auth/verify-email-mfa` with email and 6-digit MFA code
 * to complete the fallback email MFA authentication process after login.
 *
 * @param emailMfaDto - The email and 6-digit code sent to the user.
 * @returns {Promise<AuthResponseDto>} A promise resolving to the final access token if verification succeeds or terms required and temp token.
 */
export async function verifyEmailMfa(
  emailMfaDto: EmailMfaDto,
): Promise<AuthResponseDto> {
  const res = await axiosInstance.post<AuthResponseDto>(
    '/auth/verify-email-mfa',
    emailMfaDto,
  );
  return res.data;
}

/**
 * Retrieve MFA setup details from the server.
 *
 * This function sends a POST request to the `/auth/setup-mfa` endpoint to retrieve the MFA setup details,
 * which include the secret and QR code required to configure multi-factor authentication for a user.
 *
 * @returns {Promise<MfaResponseDto>} A promise that resolves with the MFA response data containing the QR code and secret.
 */
export async function getMfaSetup(): Promise<MfaResponseDto> {
  const res = await axiosInstance.post<MfaResponseDto>('/auth/setup-mfa');
  return res.data;
}

/**
 * Confirm the MFA setup for the user.
 *
 * This function sends a POST request to the `/auth/confirm-mfa` endpoint with the provided MFA token details.
 * It returns a promise that resolves to a boolean value indicating whether the MFA setup confirmation was successful.
 *
 * @param {MfaDto} mfaDto - The MFA data transfer object containing the 6-digit MFA token used for confirmation.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the MFA setup is confirmed, or `false` otherwise.
 */
export async function confirmMfaSetup(mfaDto: MfaDto): Promise<boolean> {
  const res = await axiosInstance.post<boolean>('/auth/confirm-mfa', mfaDto);
  return res.data;
}

/**
 * Logs out the user by calling the `/auth/logout` endpoint.
 * This clears all session-related cookies on the backend.
 *
 * @returns {Promise<void>} A promise that resolves when the logout is complete.
 */
export async function logout(): Promise<void> {
  await axiosInstance.post('/auth/logout');
}

/**
 * Sends a POST request to `/auth/accept-terms` with a temporary JWT ticket and an explicit acceptance.
 * The backend will validate the `ticket` and, if valid, update the user's `termsVersion`.
 * On success, an updated access token is returned.
 *
 * @param acceptTermsDto - The `AcceptTermsDto` containing:
 *   - `ticket`: Temporary JWT ticket authorizing the user to accept the latest terms
 *   - `accepted`: Must be `true` to confirm acceptance
 * @returns {Promise<AuthResponseDto>} A promise resolving to a new access token after terms have been accepted.
 */
export async function acceptTerms(
  acceptTermsDto: AcceptTermsDto,
): Promise<AuthResponseDto> {
  const res = await axiosInstance.post<AuthResponseDto>(
    '/auth/accept-terms',
    acceptTermsDto,
  );
  return res.data;
}
