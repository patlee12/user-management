/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProfileEntity } from '../models/ProfileEntity';
import type { UpdateProfileDto } from '../models/UpdateProfileDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProfileService {
    /**
     * @returns ProfileEntity
     * @throws ApiError
     */
    public static currentUserProfileControllerGetOwnProfile(): CancelablePromise<ProfileEntity> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/user/profile',
        });
    }
    /**
     * @param requestBody
     * @returns ProfileEntity
     * @throws ApiError
     */
    public static currentUserProfileControllerUpdateOwnProfile(
        requestBody: UpdateProfileDto,
    ): CancelablePromise<ProfileEntity> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/user/profile',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
