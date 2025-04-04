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
     * Temporary JWT ticket used for MFA verification
     */
    ticket?: string;
};

