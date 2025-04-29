/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RoleIdDto } from './RoleIdDto';
export type UpdatePermissionDto = {
    actionType?: string;
    description?: string;
    resourceId?: number;
    isActive?: boolean;
    createdBy?: number;
    updatedBy?: number;
    /**
     * Array of role IDs to associate with the permission
     */
    roles?: Array<RoleIdDto>;
};

