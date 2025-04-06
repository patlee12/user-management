/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type VerifyAccountRequestDto = {
    /**
     * The token ID used to find the account request in the database
     */
    tokenId: string;
    /**
     * The full raw token sent in the email, verified against the hashed token in the DB
     */
    providedToken: string;
};

