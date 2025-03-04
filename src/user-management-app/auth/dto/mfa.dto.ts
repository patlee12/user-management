import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

/**
 * Token from authenticator used to verify user Mfa.
 */
export class MfaDto {
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  @ApiProperty()
  token: string;
}
