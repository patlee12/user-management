import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsEmail,
} from 'class-validator';

/**
 * Data transfer object used to create a new account request.
 */
export class CreateAccountRequestDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @ApiPropertyOptional()
  name?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @ApiProperty()
  username: string;

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  @ApiProperty()
  password: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;
}
