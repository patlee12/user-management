import { UserRoles } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { RoleEntity } from './role.entity';

/**
 * Represents the association between users and roles in the system.
 * Maps to the UserRoles database model and includes role details if available.
 */
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
