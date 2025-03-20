import { mfa_auth } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

/**
 * Represents multi-factor authentication (MFA) data for a user.
 * Excludes the 'secret' field from API responses for security purposes.
 */
export class MfaAuthEntity implements mfa_auth {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @Exclude()
  @ApiProperty()
  secret: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
