/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AcceptTermsDto = {
    /**
     * Temporary JWT ticket authorizing the user to accept the latest terms
     */
    ticket: string;
    /**
     * Must explicitly confirm terms acceptance by setting to true
     */
    accepted: boolean;
};

