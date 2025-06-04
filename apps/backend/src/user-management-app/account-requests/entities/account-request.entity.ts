import { AccountRequest } from '@prisma/client';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

/**
 * Represents a AccountRequest in the system.
 * Excludes the 'password' and 'token' field from API responses for security.
 */
export class AccountRequestEntity implements AccountRequest {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @Exclude()
  @ApiHideProperty()
  password: string;

  @ApiProperty()
  tokenId: string;

  @Exclude()
  @ApiHideProperty()
  token: string;

  @ApiProperty()
  acceptedTermsAt: Date;

  @ApiProperty()
  termsVersion: string;

  @ApiProperty()
  expiresAt: Date;

  @ApiProperty()
  createdAt: Date;
}
