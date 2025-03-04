import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, IsNumber } from 'class-validator';
import { CreatePermissionDto } from './create-permission.dto';

/**
 * A data transfer object to be used for creating new roles and assigning permissions to it.
 */
export class CreateRoleDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  description: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    type: [CreatePermissionDto],
    description: 'Array of Permission associated with the Role',
    required: false,
  })
  permissions?: CreatePermissionDto[];

  @IsNumber()
  @ApiProperty()
  createdBy: number;

  @IsNumber()
  @ApiProperty()
  updatedBy: number;
}
