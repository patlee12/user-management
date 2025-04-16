import { IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType, OmitType, ApiProperty } from '@nestjs/swagger';
import { CreateRoleDto } from './create-role.dto';

/**
 * DTO for referencing a permission by ID only
 */
export class PermissionIdDto {
  @IsNumber()
  @ApiProperty({ example: 1 })
  id: number;
}

/**
 * Omit permissions so we can redefine it with ID-only array
 */
class BaseUpdateRoleDto extends OmitType(CreateRoleDto, [
  'permissions',
] as const) {}

/**
 * DTO used to update a role and optionally associate it with permission IDs
 */
export class UpdateRoleDto extends PartialType(BaseUpdateRoleDto) {
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PermissionIdDto)
  @ApiProperty({
    type: [PermissionIdDto],
    required: false,
    description: 'Array of permission IDs to associate with the role',
    example: [{ id: 1 }, { id: 2 }],
  })
  permissions?: PermissionIdDto[];
}
