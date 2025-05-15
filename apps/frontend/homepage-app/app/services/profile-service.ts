import axiosInstance from '@/lib/axiosInstance';
import { ProfileEntity, UpdateProfileDto } from '@user-management/types';

/**
 * Fetches the currently authenticated user's profile.
 * @returns {ProfileEntity}
 */
export async function fetchCurrentUserProfile(): Promise<ProfileEntity> {
  try {
    const response = await axiosInstance.get<ProfileEntity>('/user/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
}

/**
 * Updates the authenticated user's profile.
 * @param data - The profile update payload.
 * @returns {ProfileEntity}
 */
export async function updateCurrentUserProfile(
  data: UpdateProfileDto,
): Promise<ProfileEntity> {
  try {
    const response = await axiosInstance.patch<ProfileEntity>(
      '/user/profile',
      data,
    );
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}
