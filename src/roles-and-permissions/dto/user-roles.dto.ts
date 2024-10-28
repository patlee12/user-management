import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserRolesDto {
  @IsInt()
  @ApiProperty()
  userId: number;

  @IsInt()
  @ApiProperty()
  roleId: number;
}
