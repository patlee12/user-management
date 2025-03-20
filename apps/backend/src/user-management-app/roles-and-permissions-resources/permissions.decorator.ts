import { SetMetadata } from '@nestjs/common';
import { ActionType } from '@prisma/client';

export const PERMISSIONS_KEY = 'permissions';
export interface PermissionMeta {
  resourceId: number;
  actionType: ActionType;
}

/**
 * A decorator to be applied to endpoints or controllers that require user to have specific permissions.
 * @param resourceId number - The ID of the resource being accessed.
 * @param actionType ActionType - The type of action being performed (defined in Prisma schema).
 * @returns A metadata decorator.
 */
export const Permissions = (resourceId: number, actionType: ActionType) =>
  SetMetadata(PERMISSIONS_KEY, { resourceId, actionType });
