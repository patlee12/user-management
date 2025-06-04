/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserRolesDto } from './UserRolesDto';
export type CreateUserDto = {
    username: string;
    name?: string;
    password: string;
    mfaEnabled?: boolean;
    email: string;
    emailVerified?: boolean;
    /**
     * DateTime when user accepted Terms of Use
     */
    acceptedTermsAt?: string;
    /**
     * Version of the Terms of Use the user accepted
     */
    termsVersion?: string;
    /**
     * Array of UserRoles associated with the user
     */
    userRoles?: Array<UserRolesDto>;
};

