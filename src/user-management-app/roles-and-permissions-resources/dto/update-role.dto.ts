import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for updating a role.
 * This allows modifying a role and optionally updating its associated permissions.
 */
export class UpdateRoleDto {
  /**
   * List of permissions to associate with the role.
   * Each permission must be a valid object containing an `id` field.
   *
   * @example [{ "id": 1 }, { "id": 2 }]
   */
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PermissionIdDto)
  permissions?: PermissionIdDto[];
}

/**
 * DTO for referencing a permission by its ID.
 */
export class PermissionIdDto {
  id: number;
}
