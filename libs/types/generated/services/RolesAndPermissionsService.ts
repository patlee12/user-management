/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreatePermissionDto } from '../models/CreatePermissionDto';
import type { CreateRoleDto } from '../models/CreateRoleDto';
import type { PermissionEntity } from '../models/PermissionEntity';
import type { RoleEntity } from '../models/RoleEntity';
import type { UpdatePermissionDto } from '../models/UpdatePermissionDto';
import type { UpdateRoleDto } from '../models/UpdateRoleDto';
import type { UserRolesDto } from '../models/UserRolesDto';
import type { UserRolesEntity } from '../models/UserRolesEntity';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RolesAndPermissionsService {
    /**
     * @param requestBody
     * @returns RoleEntity
     * @throws ApiError
     */
    public static rolesPermissionsResourcesControllerCreateRole(
        requestBody: CreateRoleDto,
    ): CancelablePromise<RoleEntity> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/roles-and-permissions/create-role',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns PermissionEntity
     * @throws ApiError
     */
    public static rolesPermissionsResourcesControllerCreatePermission(
        requestBody: CreatePermissionDto,
    ): CancelablePromise<PermissionEntity> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/roles-and-permissions/create-permission',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns UserRolesEntity
     * @throws ApiError
     */
    public static rolesPermissionsResourcesControllerCreateUserRole(
        requestBody: UserRolesDto,
    ): CancelablePromise<UserRolesEntity> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/roles-and-permissions/create-userRole',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns RoleEntity
     * @throws ApiError
     */
    public static rolesPermissionsResourcesControllerGetAllRoles(): CancelablePromise<Array<RoleEntity>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/roles-and-permissions/roles',
        });
    }
    /**
     * @returns RoleEntity
     * @throws ApiError
     */
    public static rolesPermissionsResourcesControllerGetAllRolesWithPermissions(): CancelablePromise<Array<RoleEntity>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/roles-and-permissions/roles-and-permissions',
        });
    }
    /**
     * @returns PermissionEntity
     * @throws ApiError
     */
    public static rolesPermissionsResourcesControllerGetAllPermissions(): CancelablePromise<Array<PermissionEntity>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/roles-and-permissions/permissions',
        });
    }
    /**
     * @param id
     * @returns RoleEntity
     * @throws ApiError
     */
    public static rolesPermissionsResourcesControllerFindOneRole(
        id: string,
    ): CancelablePromise<RoleEntity> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/roles-and-permissions/role/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @returns RoleEntity
     * @throws ApiError
     */
    public static rolesPermissionsResourcesControllerRemoveRole(
        id: string,
    ): CancelablePromise<RoleEntity> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/roles-and-permissions/role/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @returns PermissionEntity
     * @throws ApiError
     */
    public static rolesPermissionsResourcesControllerFindOnePermission(
        id: string,
    ): CancelablePromise<PermissionEntity> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/roles-and-permissions/permission/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @returns PermissionEntity
     * @throws ApiError
     */
    public static rolesPermissionsResourcesControllerRemovePermission(
        id: string,
    ): CancelablePromise<PermissionEntity> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/roles-and-permissions/permission/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param userId
     * @returns UserRolesEntity
     * @throws ApiError
     */
    public static rolesPermissionsResourcesControllerGetAllUserRolesByUserId(
        userId: string,
    ): CancelablePromise<Array<UserRolesEntity>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/roles-and-permissions/user-roles/{userId}',
            path: {
                'userId': userId,
            },
        });
    }
    /**
     * @param roleId
     * @param requestBody
     * @returns RoleEntity
     * @throws ApiError
     */
    public static rolesPermissionsResourcesControllerUpdateRole(
        roleId: string,
        requestBody: UpdateRoleDto,
    ): CancelablePromise<RoleEntity> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/roles-and-permissions/role/{roleId}',
            path: {
                'roleId': roleId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param permissionId
     * @param requestBody
     * @returns PermissionEntity
     * @throws ApiError
     */
    public static rolesPermissionsResourcesControllerUpdatePermission(
        permissionId: string,
        requestBody: UpdatePermissionDto,
    ): CancelablePromise<PermissionEntity> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/roles-and-permissions/permission/{permissionId}',
            path: {
                'permissionId': permissionId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns UserRolesEntity
     * @throws ApiError
     */
    public static rolesPermissionsResourcesControllerRemoveUserRole(
        requestBody: UserRolesDto,
    ): CancelablePromise<UserRolesEntity> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/roles-and-permissions/userRole',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
