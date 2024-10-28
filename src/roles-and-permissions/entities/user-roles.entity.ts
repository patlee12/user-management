import { UserRoles } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UserRolesEntity implements UserRoles {
  @ApiProperty()
  userId: number;

  @ApiProperty()
  roleId: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
