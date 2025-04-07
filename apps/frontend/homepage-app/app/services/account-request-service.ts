import axiosInstance from '@/lib/axiosInstance';
import {
  AccountRequestEntity,
  CreateAccountRequestDto,
  UserEntity,
  VerifyAccountRequestDto,
} from '@user-management/types';

/**
 * Submits an account request to the backend.
 * @param data - The account request payload.
 * @returns {AccountRequestEntity}
 */
export async function submitAccountRequest(
  data: CreateAccountRequestDto,
): Promise<AccountRequestEntity> {
  try {
    const newAccountRequest: AccountRequestEntity = await axiosInstance.post(
      '/account-requests',
      data,
    );
    return newAccountRequest;
  } catch (error) {
    console.error('Error submitting account request:', error);
    throw error;
  }
}

/**
 * Verifys there provided token and then if valid creates a new user account.
 * @param verifyAccountRequestDto - The verify account request payload.
 * @returns {UserEntity}
 */
export async function verifyEmailToken(
  verifyAccountRequestDto: VerifyAccountRequestDto,
): Promise<UserEntity> {
  return await axiosInstance.post(
    '/account-requests/verify',
    verifyAccountRequestDto,
  );
}
