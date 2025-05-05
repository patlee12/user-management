/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthResponseDto } from '../models/AuthResponseDto';
import type { EmailMfaDto } from '../models/EmailMfaDto';
import type { LoginDto } from '../models/LoginDto';
import type { MfaDto } from '../models/MfaDto';
import type { MfaResponseDto } from '../models/MfaResponseDto';
import type { UserEntity } from '../models/UserEntity';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * Login with email/username and password and optionally MFA token.
     * Returns an access token if MFA is not enabled or the token is valid. If MFA is enabled and no token is provided, returns a temporary ticket for completing the MFA challenge.
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
     * Redirect to Google for OAuth login
     * @returns any
     * @throws ApiError
     */
    public static authControllerGoogleAuth(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/auth/google',
        });
    }
    /**
     * Handle Google OAuth callback
     * @returns any
     * @throws ApiError
     */
    public static authControllerGoogleAuthCallback(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/auth/google/callback',
        });
    }
    /**
     * Verify MFA ticket + 6-digit token to complete login.
     * Use this endpoint after receiving a `ticket` from /login if MFA was required. Returns a final access token if the token is valid.
     * @param requestBody
     * @returns AuthResponseDto
     * @throws ApiError
     */
    public static authControllerVerifyMfaTicket(
        requestBody: MfaDto,
    ): CancelablePromise<AuthResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/verify-mfa',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Verify 6-digit email MFA code to complete login.
     * Use this after login when the response has `emailMfaRequired: true`. This endpoint verifies the email and code and issues a final access token.
     * @param requestBody
     * @returns AuthResponseDto
     * @throws ApiError
     */
    public static authControllerVerifyEmailMfa(
        requestBody: EmailMfaDto,
    ): CancelablePromise<AuthResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/verify-email-mfa',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Generate MFA secret and QR code for user setup.
     * Returns the MFA secret and QR code image to register with an authenticator app.
     * @returns MfaResponseDto
     * @throws ApiError
     */
    public static authControllerSetupMfa(): CancelablePromise<MfaResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/setup-mfa',
        });
    }
    /**
     * Confirm MFA token and activate MFA on account.
     * Verifies the user's 6-digit MFA token during setup and enables MFA if valid.
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static authControllerConfirmMfa(
        requestBody: MfaDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/confirm-mfa',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get the currently authenticated user
     * @returns UserEntity
     * @throws ApiError
     */
    public static authControllerGetMe(): CancelablePromise<UserEntity> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/auth/me',
        });
    }
    /**
     * Log out by clearing the auth cookies
     * @returns any
     * @throws ApiError
     */
    public static authControllerLogout(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/logout',
        });
    }
}
