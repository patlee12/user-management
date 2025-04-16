import { IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType, OmitType, ApiProperty } from '@nestjs/swagger';
import { CreatePermissionDto } from './create-permission.dto';

/**
 * Dto for referencing a role by its Id.
 */
export class RoleIdDto {
  @IsNumber()
  @ApiProperty({ example: 1 })
  id: number;
}

/**
 * Omit 'roles' so we can redefine it
 */
class BaseUpdatePermissionDto extends OmitType(CreatePermissionDto, [
  'roles',
] as const) {}

/**
 * Data transfer object for updating a permission.
 */
export class UpdatePermissionDto extends PartialType(BaseUpdatePermissionDto) {
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RoleIdDto)
  @ApiProperty({
    type: [RoleIdDto],
    required: false,
    description: 'Array of role IDs to associate with the permission',
    example: [{ id: 1 }, { id: 2 }],
  })
  roles?: RoleIdDto[];
}
