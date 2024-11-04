import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
