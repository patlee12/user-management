import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { PermissionEntity } from './permission.entity';

export class RoleEntity implements Role {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ required: false, nullable: true })
  permissionIds?: number[];

  @ApiProperty({ required: false, nullable: true })
  permissions?: PermissionEntity[];

  @ApiProperty()
  createdBy: number;

  @ApiProperty()
  updatedBy: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
