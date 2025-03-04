import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data transfer object used for assignment of user roles.
 */
export class UserRolesDto {
  @IsNumber()
  @ApiProperty()
  userId: number;

  @IsNumber()
  @ApiProperty()
  roleId: number;

  @IsNumber()
  @ApiProperty()
  assignedBy: number;
}
