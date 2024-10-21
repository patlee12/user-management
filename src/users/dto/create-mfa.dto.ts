import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsEmail,
  IsBase32,
} from 'class-validator';

export class CreateMfaDto {
  @IsString()
  @IsBase32()
  @IsNotEmpty()
  @ApiProperty()
  secret: string;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty()
  userId: number;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;
}
