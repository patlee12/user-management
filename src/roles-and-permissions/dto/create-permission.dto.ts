import { ApiProperty } from '@nestjs/swagger';
import { ActionType } from '@prisma/client';
import {
  IsOptional,
  IsString,
  IsArray,
  IsBoolean,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { CreateRoleDto } from './create-role.dto';

export class CreatePermissionDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsEnum(ActionType, {
    message: `Must be one of the following values: ${Object.values(ActionType).join(', ')}`,
  })
  @ApiProperty()
  actionType: ActionType;

  @IsString()
  @ApiProperty()
  description: string;

  @ApiProperty()
  @IsNumber()
  resourceId: number;

  @IsBoolean()
  @ApiProperty()
  isActive: boolean;

  @IsNumber()
  @ApiProperty()
  createdBy: number;

  @IsNumber()
  @ApiProperty()
  updatedBy: number;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    type: [CreateRoleDto],
    description: 'Array of Roles associated with the permission',
    required: false,
  })
  roles?: CreateRoleDto[];
}
