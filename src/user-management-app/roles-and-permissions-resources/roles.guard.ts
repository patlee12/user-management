import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesPermissionsResourcesService } from './roles-permissions-resources.service';
import { UserRolesEntity } from './entities/user-roles.entity';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private rolesPermissionsResourcesService: RolesPermissionsResourcesService,
  ) {}

  /**
   * Checks whether the user has at least one of the required roles to access the requested resource.
   * If the user lacks the required roles, a `ForbiddenException` is thrown.
   * @param context - The execution context containing the request and handler information.
   * @returns {boolean} indicating whether access is granted.
   * @throws {ForbiddenException} If the user is not found, has no roles, or lacks the required role.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const getRequiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (!getRequiredRoles) {
      return true;
    }

    const request = await context.switchToHttp().getRequest();
    const user: UserEntity = request.user;
    const lookupUserRoles: UserRolesEntity[] =
      await this.rolesPermissionsResourcesService.findUserRolesByUserId(
        user.id,
      );

    if (!user || !lookupUserRoles) {
      throw new ForbiddenException('Access Denied: No roles found');
    }

    const mapRoleNames: string[] = lookupUserRoles.map(
      (UserRole) => UserRole.role.name,
    );

    const hasRole = getRequiredRoles.some((role) =>
      mapRoleNames.includes(role),
    );

    if (!hasRole) {
      throw new ForbiddenException('Access Denied: Insufficient permissions');
    }

    return hasRole;
  }
}
