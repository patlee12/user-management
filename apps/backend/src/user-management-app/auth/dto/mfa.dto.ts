import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

/**
 * DTO used to verify user MFA after login.
 */
export class MfaDto {
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  @ApiProperty({ description: '6-digit token from authenticator app' })
  token: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'MFA temp ticket ' })
  ticket?: string;
}
