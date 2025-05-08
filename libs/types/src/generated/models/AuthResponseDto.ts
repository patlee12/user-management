/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AuthResponseDto = {
    /**
     * JWT access token for authenticated session
     */
    accessToken?: string;
    /**
     * Whether MFA is required
     */
    mfaRequired?: boolean;
    /**
     * Whether email MFA is required
     */
    emailMfaRequired?: boolean;
    /**
     * Whether email MFA is required
     */
    userId?: number;
    /**
     * Whether email MFA is required
     */
    email?: string;
    /**
     * Temporary JWT ticket used for MFA verification
     */
    ticket?: string;
};

