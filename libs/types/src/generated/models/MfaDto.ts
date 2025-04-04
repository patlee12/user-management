/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MfaDto = {
    /**
     * 6-digit token from authenticator app
     */
    token: string;
    /**
     * MFA ticket received from /auth/login
     */
    ticket: string;
};

