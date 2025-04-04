import axiosInstance from '@/lib/axiosInstance';
import { AuthResponseDto, LoginDto, MfaDto } from '@user-management/types';

/**
 * Sends a login request to the backend using email and password.
 * If MFA is enabled on the account, the response will include a temporary `ticket`
 * and `mfaRequired: true` instead of an access token.
 *
 * @param loginDto - The login data (email and password).
 * @returns A promise resolving to either an access token or MFA challenge response.
 */
export async function login(loginDto: LoginDto): Promise<AuthResponseDto> {
  const res = await axiosInstance.post<AuthResponseDto>(
    '/auth/login',
    loginDto,
  );
  return res.data;
}

/**
 * Submits a 6-digit MFA token along with a temporary ticket
 * to complete the authentication process after login.
 *
 * @param mfaDto - The MFA token and ticket from the previous login step.
 * @returns A promise resolving to the final access token if verification succeeds.
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
