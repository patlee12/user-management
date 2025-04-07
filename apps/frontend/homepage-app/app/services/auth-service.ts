import axiosInstance from '@/lib/axiosInstance';
import {
  AuthResponseDto,
  LoginDto,
  MfaDto,
  MfaResponseDto,
} from '@user-management/types';

/**
 * Sends a login POST request to the backend `/auth/login` using email and password.
 * If MFA is enabled on the account, the response will include a temporary `ticket`
 * and `mfaRequired: true` instead of an access token.
 *
 * @param loginDto - The login data (email and password).
 * @returns {Promise<AuthResponseDto>}A promise resolving to either an access token or MFA challenge response.
 */
export async function login(loginDto: LoginDto): Promise<AuthResponseDto> {
  const res = await axiosInstance.post<AuthResponseDto>(
    '/auth/login',
    loginDto,
  );
  return res.data;
}

/**
 * Submits POST request to `/auth/verify-mfa` with a 6-digit MFA token along with a temporary ticket
 * to complete the authentication process after login.
 *
 * @param mfaDto - The MFA token and ticket from the previous login step.
 * @returns {Promise<AuthResponseDto>} A promise resolving to the final access token if verification succeeds.
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
 * Retrieve MFA setup details from the server.
 *
 * This function sends a POST request to the `/auth/setup-mfa` endpoint to retrieve the MFA setup details,
 * which include the secret and QR code required to configure multi-factor authentication for a user.
 *
 * @returns {Promise<MfaResponseDto>} A promise that resolves with the MFA response data containing the QR code and secret.
 */
export async function getMfaSetup(): Promise<MfaResponseDto> {
  const res = await axiosInstance.post('/auth/setup-mfa');
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
