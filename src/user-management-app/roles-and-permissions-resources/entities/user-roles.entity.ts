import { UserRoles } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { RoleEntity } from './role.entity';

export class UserRolesEntity implements UserRoles {
  @ApiProperty()
  userId: number;

  @ApiProperty()
  roleId: number;

  @ApiProperty()
  assignedBy: number;

  @ApiProperty()
  role?: RoleEntity;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
