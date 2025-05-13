/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProfileEntity } from '../models/ProfileEntity';
import type { UpdateProfileDto } from '../models/UpdateProfileDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProfilesService {
    /**
     * @param userId
     * @returns ProfileEntity
     * @throws ApiError
     */
    public static profilesControllerFindOne(
        userId: number,
    ): CancelablePromise<ProfileEntity> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/profiles/{userId}',
            path: {
                'userId': userId,
            },
        });
    }
    /**
     * @param userId
     * @param requestBody
     * @returns ProfileEntity
     * @throws ApiError
     */
    public static profilesControllerUpdate(
        userId: number,
        requestBody: UpdateProfileDto,
    ): CancelablePromise<ProfileEntity> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/profiles/{userId}',
            path: {
                'userId': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
