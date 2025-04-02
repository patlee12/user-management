/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ConfirmPasswordResetDto = {
    userId: number;
    /**
     * The password reset token that was sent to the user via email and verified in the first step
     */
    token: string;
    /**
     * The new password that the user wants to set
     */
    newPassword: string;
};

