/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ConfirmPasswordResetDto } from '../models/ConfirmPasswordResetDto';
import type { CreatePasswordResetDto } from '../models/CreatePasswordResetDto';
import type { PasswordResetEntity } from '../models/PasswordResetEntity';
import type { UpdatePasswordResetDto } from '../models/UpdatePasswordResetDto';
import type { UserEntity } from '../models/UserEntity';
import type { ValidatePasswordResetDto } from '../models/ValidatePasswordResetDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PasswordResetService {
    /**
     * @param requestBody
     * @returns PasswordResetEntity
     * @throws ApiError
     */
    public static passwordResetControllerCreate(
        requestBody: CreatePasswordResetDto,
    ): CancelablePromise<PasswordResetEntity> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/password-reset',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns PasswordResetEntity
     * @throws ApiError
     */
    public static passwordResetControllerFindAll(): CancelablePromise<Array<PasswordResetEntity>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/password-reset',
        });
    }
    /**
     * @param requestBody
     * @returns PasswordResetEntity
     * @throws ApiError
     */
    public static passwordResetControllerValidateResetToken(
        requestBody: ValidatePasswordResetDto,
    ): CancelablePromise<PasswordResetEntity> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/password-reset/validate',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns UserEntity
     * @throws ApiError
     */
    public static passwordResetControllerConfirmPasswordReset(
        requestBody: ConfirmPasswordResetDto,
    ): CancelablePromise<UserEntity> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/password-reset/confirm',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns PasswordResetEntity
     * @throws ApiError
     */
    public static passwordResetControllerFindOne(
        id: string,
    ): CancelablePromise<PasswordResetEntity> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/password-reset/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns PasswordResetEntity
     * @throws ApiError
     */
    public static passwordResetControllerUpdate(
        id: string,
        requestBody: UpdatePasswordResetDto,
    ): CancelablePromise<PasswordResetEntity> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/password-reset/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns PasswordResetEntity
     * @throws ApiError
     */
    public static passwordResetControllerRemove(
        id: string,
    ): CancelablePromise<PasswordResetEntity> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/password-reset/{id}',
            path: {
                'id': id,
            },
        });
    }
}
