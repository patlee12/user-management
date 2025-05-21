/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateAccountRequestDto = {
    name?: string;
    username?: string;
    password?: string;
    email?: string;
    /**
     * The datetime the user accepted the terms
     */
    acceptedTermsAt?: string;
    /**
     * Version of the terms the user accepted
     */
    termsVersion?: string;
};

