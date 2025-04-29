import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO used to verify user email MFA after login.
 */
export class EmailMfaDto {
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  @ApiProperty({ description: '6-digit token from email' })
  token: string;

  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  @ApiProperty()
  email: string;
}
