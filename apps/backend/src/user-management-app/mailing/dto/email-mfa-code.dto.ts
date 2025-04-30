import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * Data transfer object used to send a one-time email MFA code for login.
 */
export class EmailMfaCodeDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'The one-time security code sent via email.' })
  code: string;
}
