import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsEmail,
  IsDate,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * Data transfer object used to create a new account request.
 */
export class CreateAccountRequestDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @Transform(({ value }) => (value === '' ? undefined : value))
  @ApiPropertyOptional()
  name?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @Transform(({ value }) => value.toLowerCase())
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
  @Transform(({ value }) => value.toLowerCase())
  @ApiProperty()
  email: string;

  @IsDate()
  @Type(() => Date)
  @ApiProperty({ description: 'The datetime the user accepted the terms' })
  acceptedTermsAt: Date;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Version of the terms the user accepted' })
  termsVersion: string;
}
