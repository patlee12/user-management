import { Permission, ActionType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

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
