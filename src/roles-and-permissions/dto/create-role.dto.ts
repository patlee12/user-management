import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray } from 'class-validator';

export class CreateRoleDto {
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
    type: [Number],
    description: 'Array of Permission IDs associated with the Role',
    required: false,
  })
  permissions?: number[];
}
