/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PermissionIdDto } from './PermissionIdDto';
export type UpdateRoleDto = {
    name?: string;
    description?: string;
    createdBy?: number;
    updatedBy?: number;
    /**
     * Array of permission IDs to associate with the role
     */
    permissions?: Array<PermissionIdDto>;
};

