/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserRolesDto } from './UserRolesDto';
export type UpdateUserDto = {
    username?: string;
    name?: string;
    password?: string;
    mfaEnabled?: boolean;
    email?: string;
    emailVerified?: boolean;
    /**
     * Array of UserRoles associated with the user
     */
    userRoles?: Array<UserRolesDto>;
};

