import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
/**
 * Data transfer object for updating a permission.
 * This allows modifying a permission and optionally updating its associated roles.
 */
export class UpdatePermissionDto {
  /**
   * List of roles to associate with the permission.
   * Each role must be a valid object containing an `id` field.
   * @example [{ "id": 1 }, { "id": 2 }]
   */
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RoleIdDto)
  roles?: RoleIdDto[];
}

/**
 * Dto for referencing a role by its Id.
 */
export class RoleIdDto {
  id: number;
}
