import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

/**
 * A resource Dto used for creating new resources throughout the app that can have a set of permissions associated to it.
 */
export class CreateResourceDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  description: string;

  @IsNumber()
  @ApiProperty()
  createdBy: number;

  @IsString()
  @ApiProperty()
  updatedBy: number;
}
