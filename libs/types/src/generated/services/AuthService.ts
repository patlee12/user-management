/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthResponseDto } from '../models/AuthResponseDto';
import type { LoginDto } from '../models/LoginDto';
import type { MfaDto } from '../models/MfaDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * Login successfully and receive an access token.
     * Copy access token and paste it in the Authorize value field (Click 'Authorize' button in top right corner of page). If you need an account use Admin Email and password from .env file.
     * @param requestBody
     * @returns AuthResponseDto
     * @throws ApiError
     */
    public static authControllerLogin(
        requestBody: LoginDto,
    ): CancelablePromise<AuthResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Setup MFA with an authenticator app.
     * Because we are using swagger module you need to copy the 'secret' in response and manually create and paste it in the authenticator app.
     * @returns any
     * @throws ApiError
     */
    public static authControllerSetupMfa(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/setup-mfa',
        });
    }
    /**
     * Verify MFA Token from Authenticator App
     * Verifies a 6-digit MFA token and enables MFA for the user's account if valid.
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static authControllerVerifyMfa(
        requestBody: MfaDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/verify-mfa',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
