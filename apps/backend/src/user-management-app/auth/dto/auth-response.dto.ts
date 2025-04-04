import { ApiPropertyOptional } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiPropertyOptional({
    description: 'JWT access token for authenticated session',
  })
  accessToken?: string;

  @ApiPropertyOptional({ description: 'Whether MFA is required' })
  mfaRequired?: true;

  @ApiPropertyOptional({
    description: 'Temporary JWT ticket used for MFA verification',
  })
  ticket?: string;
}
