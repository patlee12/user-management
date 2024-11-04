import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePermissionDto {
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RoleIdDto)
  roles?: RoleIdDto[];
}

export class RoleIdDto {
  id: number;
}
