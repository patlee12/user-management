import { Permission, ActionType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Represents a permission in the system, mapped from the database model.
 * Defines actions that can be performed on a specific resource.
 */
export class PermissionEntity implements Permission {
  @ApiProperty()
  id: number;

  @ApiProperty()
  actionType: ActionType;

  @ApiProperty()
  description: string;

  @ApiProperty()
  resourceId: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ required: false, nullable: true })
  roles?: number[];

  @ApiProperty()
  createdBy: number;

  @ApiProperty()
  updatedBy: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
