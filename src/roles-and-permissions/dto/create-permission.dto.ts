import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray } from 'class-validator';
import { CreateRoleDto } from './create-role.dto';

export class CreatePermissionDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  description?: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    type: [CreateRoleDto],
    description: 'Array of Roles associated with the permission',
    required: false,
  })
  roles?: CreateRoleDto[];
}
