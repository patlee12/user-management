/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreatePermissionDto = {
    actionType: string;
    description: string;
    resourceId: number;
    isActive: boolean;
    createdBy: number;
    updatedBy: number;
    /**
     * Array of Roles associated with the permission
     */
    roles?: Array<any[]>;
};

