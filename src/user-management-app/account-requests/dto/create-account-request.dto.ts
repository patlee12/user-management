import { ApiProperty } from '@nestjs/swagger';
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
import { Type } from 'class-transformer';

/**
 * Data transfer object used to create a new account request.
 */
export class CreateAccountRequestDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @ApiProperty({ required: false })
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

  @ApiProperty({ required: false })
  token?: string;

  @IsDate()
  @Type(() => Date)
  @ApiProperty()
  expiresAt: Date;
}
