import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

/**
 * DTO used to verify user MFA after login.
 */
export class MfaDto {
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  @ApiProperty({ description: '6-digit token from authenticator app' })
  token: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'MFA temp ticket ' })
  ticket: string;
}
