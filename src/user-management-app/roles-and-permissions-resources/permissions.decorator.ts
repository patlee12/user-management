import { SetMetadata } from '@nestjs/common';
import { ActionType } from '@prisma/client';

export const PERMISSIONS_KEY = 'permissions';
export interface PermissionMeta {
  resourceId: number;
  actionType: ActionType;
}

export const Permissions = (resourceId: number, actionType: ActionType) =>
  SetMetadata(PERMISSIONS_KEY, { resourceId, actionType });
