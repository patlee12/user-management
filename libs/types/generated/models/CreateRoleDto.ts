/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreatePermissionDto } from './CreatePermissionDto';
export type CreateRoleDto = {
    name: string;
    description: string;
    /**
     * Array of Permission associated with the Role
     */
    permissions?: Array<CreatePermissionDto>;
    createdBy: number;
    updatedBy: number;
};

