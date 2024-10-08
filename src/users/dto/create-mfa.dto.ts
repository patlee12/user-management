import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsEmail,
  IsBase32,
  IsBoolean,
} from 'class-validator';

export class CreateMfaDto {
  @IsString()
  @IsBase32()
  @IsNotEmpty()
  @ApiProperty()
  secret: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false })
  enabled?: boolean;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty()
  userId: number;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;
}
