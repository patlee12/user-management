import { ApiProperty } from '@nestjs/swagger';

export class MfaResponseDto {
  @ApiProperty()
  qrCode: string;

  @ApiProperty()
  secret: string;
}
