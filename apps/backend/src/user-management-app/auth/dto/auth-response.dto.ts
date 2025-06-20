import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsString } from 'class-validator';

export class AuthResponseDto {
  @ApiPropertyOptional({
    description: 'JWT access token for authenticated session',
  })
  accessToken?: string;

  @ApiPropertyOptional({ description: 'Whether MFA is required' })
  mfaRequired?: true;

  @ApiPropertyOptional({ description: 'Whether terms are required' })
  termsRequired?: true;

  @ApiPropertyOptional({
    description: 'Temporary JWT ticket used for MFA verification',
  })
  @IsString()
  termsVersion?: string;

  @ApiPropertyOptional({ description: 'Whether email MFA is required' })
  emailMfaRequired?: true;

  @ApiPropertyOptional({ description: 'Whether email MFA is required' })
  @IsNumber()
  userId?: number;

  @ApiPropertyOptional({ description: 'Whether email MFA is required' })
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Temporary JWT ticket used for MFA verification',
  })
  ticket?: string;
}
