import axiosInstance from '@/lib/axiosInstance';
import {
  ConfirmPasswordResetDto,
  CreatePasswordResetDto,
  PasswordResetEntity,
  UserEntity,
} from '@user-management/types';

/**
 * Submits a POST request to `/password-reset` that create a password reset request and emails the user with a token.
 * @param dto - email or userId
 * @returns {Promise<PasswordResetEntity>}
 */
export async function submitPasswordReset(
  dto: CreatePasswordResetDto,
): Promise<PasswordResetEntity> {
  const res = await axiosInstance.post<PasswordResetEntity>(
    '/password-reset',
    dto,
  );
  return res.data;
}

export async function confirmPasswordReset(
  dto: ConfirmPasswordResetDto,
): Promise<UserEntity> {
  const res = await axiosInstance.post('/password-reset/confirm', dto);
  return res.data;
}

/**
 * Lookup password reset by userId.
 * @param userId
 * @returns {PasswordResetEntity}
 */
export async function findPasswordResetByUserId(
  userId: number,
): Promise<PasswordResetEntity> {
  const res = await axiosInstance.get(`/password-reset/byUserId/${userId}`);
  return res.data;
}

/**
 * Lookup password reset by email.
 * @param email
 * @returns {PasswordResetEntity}
 */
export async function findPasswordResetByEmail(
  email: string,
): Promise<PasswordResetEntity> {
  const res = await axiosInstance.get(`/password-reset/byEmail/${email}`);
  return res.data;
}
