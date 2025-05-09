/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ValidatePasswordResetDto = {
    /**
     * The ID of the user requesting the password reset validation
     */
    userId: number;
    /**
     * The raw token received in the reset password email
     */
    token: string;
};

