import { ApiProperty } from '@nestjs/swagger';

/**
 * Data transfer object response after user requests to setup Mfa.
 */
export class MfaResponseDto {
  @ApiProperty({ description: 'Qr Code encoding' })
  qrCode: string;

  @ApiProperty({ description: 'Secret to be stored on authenticator app' })
  secret: string;
}
