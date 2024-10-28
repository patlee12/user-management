import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray } from 'class-validator';

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
    type: [Number],
    description: 'Array of Role IDs associated with the permission',
    required: false,
  })
  roles?: number[];
}
