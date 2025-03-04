import { ApiProperty } from '@nestjs/swagger';

/**
 * Authorized JWT token hashed.
 */
export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;
}
