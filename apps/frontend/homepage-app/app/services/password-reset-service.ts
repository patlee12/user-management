import axiosInstance from '@/lib/axiosInstance';
import {
  ConfirmPasswordResetDto,
  CreatePasswordResetDto,
  PasswordResetEntity,
  UserEntity,
  ValidatePasswordResetDto,
} from '@user-management/types';

/**
 * Creates a password reset request and triggers an email to the user with a reset link.
 * The backend stores a hashed token and expiration time.
 *
 * @param dto - The DTO containing either the user's email or userId
 * @returns {Promise<PasswordResetEntity>} - The created password reset record
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

/**
 * Confirms a password reset by verifying the provided token and updating the user's password.
 * If the token is valid and not expired, the password is updated and the password reset record is deleted.
 *
 * @param dto - The DTO containing userId, token, and newPassword
 * @returns {Promise<UserEntity>} - The updated user entity after password reset
 */
export async function confirmPasswordReset(
  dto: ConfirmPasswordResetDto,
): Promise<UserEntity> {
  const res = await axiosInstance.post('/password-reset/confirm', dto);
  return res.data;
}

/**
 * Validates a password reset token using a POST request with the token and userId in the request body.
 * Used to verify the authenticity of the reset link before allowing the user to reset their password.
 *
 * @param dto - The DTO containing userId and raw token
 * @returns {Promise<PasswordResetEntity>} - The matching password reset entry if valid
 * @throws {Error} - If the token is invalid or expired
 */
export async function validatePasswordReset(
  dto: ValidatePasswordResetDto,
): Promise<PasswordResetEntity> {
  const res = await axiosInstance.post('password-reset/validate', dto);
  return res.data;
}
