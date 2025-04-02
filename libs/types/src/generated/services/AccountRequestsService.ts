/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AccountRequestEntity } from '../models/AccountRequestEntity';
import type { CreateAccountRequestDto } from '../models/CreateAccountRequestDto';
import type { UpdateAccountRequestDto } from '../models/UpdateAccountRequestDto';
import type { UserEntity } from '../models/UserEntity';
import type { VerifyAccountRequestDto } from '../models/VerifyAccountRequestDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AccountRequestsService {
    /**
     * @param requestBody
     * @returns AccountRequestEntity
     * @throws ApiError
     */
    public static accountRequestsControllerCreate(
        requestBody: CreateAccountRequestDto,
    ): CancelablePromise<AccountRequestEntity> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/account-requests',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns AccountRequestEntity
     * @throws ApiError
     */
    public static accountRequestsControllerFindAll(): CancelablePromise<Array<AccountRequestEntity>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/account-requests',
        });
    }
    /**
     * @param requestBody
     * @returns UserEntity
     * @throws ApiError
     */
    public static accountRequestsControllerVerifyAccountRequest(
        requestBody: VerifyAccountRequestDto,
    ): CancelablePromise<UserEntity> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/account-requests/verify',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns AccountRequestEntity
     * @throws ApiError
     */
    public static accountRequestsControllerFindOne(
        id: string,
    ): CancelablePromise<AccountRequestEntity> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/account-requests/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns AccountRequestEntity
     * @throws ApiError
     */
    public static accountRequestsControllerUpdate(
        id: string,
        requestBody: UpdateAccountRequestDto,
    ): CancelablePromise<AccountRequestEntity> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/account-requests/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns AccountRequestEntity
     * @throws ApiError
     */
    public static accountRequestsControllerRemove(
        id: string,
    ): CancelablePromise<AccountRequestEntity> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/account-requests/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param email
     * @returns AccountRequestEntity
     * @throws ApiError
     */
    public static accountRequestsControllerFindOneByEmail(
        email: string,
    ): CancelablePromise<AccountRequestEntity> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/account-requests/byEmail/{email}',
            path: {
                'email': email,
            },
        });
    }
}
