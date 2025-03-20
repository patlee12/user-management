import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Role-based access control (RBAC) decorator. This decorator is used to restrict access
 * to certain endpoints by requiring users to have specific roles. It attaches metadata
 * containing the required roles to the route handler.
 * @param roles - A list of roles required to access the decorated endpoint.
 * @returns A metadata decorator that stores the roles under the `ROLES_KEY`.
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
