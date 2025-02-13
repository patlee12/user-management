import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  Length,
} from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(12)
  @ApiProperty()
  password: string;

  @IsString()
  @IsOptional()
  @Length(6, 6)
  @ApiProperty({ required: false })
  token?: string;
}
