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

  async canActivate(context: ExecutionContext): Promise<boolean> {
    //Get info from request.
    const requiredPermission = this.reflector.get<PermissionMeta>(
      PERMISSIONS_KEY,
      context.getHandler(),
    );
    if (!requiredPermission) {
      return true; //If no permissions are required, allow access.
    }

    const { resourceId, actionType } = requiredPermission;

    //Get user permissions from Jwtpayload in request.
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
    //Check user's permissions.
    const hasPermission = userPermissions.some(
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
