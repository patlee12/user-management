/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EmailMfaCodeDto } from '../models/EmailMfaCodeDto';
import type { EmailPasswordResetDto } from '../models/EmailPasswordResetDto';
import type { EmailVerificationDto } from '../models/EmailVerificationDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MailingService {
    /**
     * Send verification email with link.
     * @param requestBody
     * @returns any Verification email sent successfully
     * @throws ApiError
     */
    public static mailingControllerSendVerificationEmail(
        requestBody: EmailVerificationDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/mailing/verification',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
            },
        });
    }
    /**
     * Send password reset email with link.
     * @param requestBody
     * @returns any Password reset email sent successfully
     * @throws ApiError
     */
    public static mailingControllerSendPasswordResetEmail(
        requestBody: EmailPasswordResetDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/mailing/reset',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
            },
        });
    }
    /**
     * Send login MFA email code.
     * @param requestBody
     * @returns any Email MFA code sent successfully
     * @throws ApiError
     */
    public static mailingControllerSendEmailMfaCode(
        requestBody: EmailMfaCodeDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/mailing/mfa',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
            },
        });
    }
}
