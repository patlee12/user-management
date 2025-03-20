import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  Length,
} from 'class-validator';

/**
 * Data transfer object passed to server to log user in and provide access token JWT on successful login.
 */
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
