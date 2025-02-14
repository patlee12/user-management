import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, PermissionMeta } from './permissions.decorator';
import { RolesPermissionsResourcesService } from './roles-permissions-resources.service';
import { UserRolesEntity } from './entities/user-roles.entity';
import { PermissionEntity } from './entities/permission.entity';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rolesPermissionsResourcesService: RolesPermissionsResourcesService,
  ) {}

  /**
   * Checks whether the user has the required permissions to access the requested resource.
   * If the user lacks the required permission, a `ForbiddenException` is thrown.
   * @param context - The execution context containing the request and handler information.
   * @returns {boolean} indicating whether access is granted.
   * @throws {ForbiddenException} If the user is not found in the request or lacks the required permissions.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const getRequiredPermission = this.reflector.get<PermissionMeta>(
      PERMISSIONS_KEY,
      context.getHandler(),
    );

    if (!getRequiredPermission) {
      return true;
    }

    const { resourceId, actionType } = getRequiredPermission;

    const request = await context.switchToHttp().getRequest();
    const user: UserEntity = request.user;

    if (!user) {
      throw new ForbiddenException('User info not found in request.');
    }

    const getUserRoles: UserRolesEntity[] =
      await this.rolesPermissionsResourcesService.findUserRolesByUserId(
        user.id,
      );

    const userPermissions: PermissionEntity[] = getUserRoles.flatMap(
      (userRole: UserRolesEntity) => userRole.role.permissions,
    );

    const hasPermission: boolean = userPermissions.some(
      (permission: PermissionEntity) =>
        permission.resourceId === resourceId &&
        permission.actionType === actionType,
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
