import { ApiProperty } from '@nestjs/swagger';

/**
 * Data transfer object response after user requests to setup Mfa.
 */
export class MfaResponseDto {
  @ApiProperty()
  qrCode: string;

  @ApiProperty()
  secret: string;
}
