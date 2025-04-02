/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
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
            url: '/mailing/send-verification-email',
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
            url: '/mailing/send-password-reset-email',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
            },
        });
    }
}
