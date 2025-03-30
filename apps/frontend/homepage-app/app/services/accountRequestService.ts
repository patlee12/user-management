import axiosInstance from '@/lib/axiosInstance';
import {
  AccountRequestEntity,
  CreateAccountRequestDto,
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
