import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateRoleDto {
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PermissionIdDto)
  permissions?: PermissionIdDto[];
}

export class PermissionIdDto {
  id: number;
}
