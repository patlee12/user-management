import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload } from '../auth/jwt.strategy';
import { RolesPermissionsResourcesService } from './roles-permissions-resources.service';
import { UserRolesEntity } from './entities/user-roles.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private rolesPermissionsResourcesService: RolesPermissionsResourcesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) {
      //If no roles are present. This is would be for public resources or routes.
      return true;
    }

    const request = await context.switchToHttp().getRequest();
    const user: JwtPayload = request.user;
    const lookupUserRoles: UserRolesEntity[] =
      await this.rolesPermissionsResourcesService.findUserRolesByUserId(
        user.userId,
      );

    if (!user || !lookupUserRoles) {
      throw new ForbiddenException('Access Denied: No roles found');
    }

    //Map roles name
    const roleNames: string[] = lookupUserRoles.map(
      (UserRole) => UserRole.role.name,
    );
    //Check if the user has at least one of the required roles
    const hasRole = requiredRoles.some((role) => roleNames.includes(role));

    if (!hasRole) {
      throw new ForbiddenException('Access Denied: Insufficient permissions');
    }

    return hasRole;
  }
}
