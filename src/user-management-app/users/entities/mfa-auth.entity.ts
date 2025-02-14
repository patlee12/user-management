import { mfa_auth } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class MfaAuthEntity implements mfa_auth {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  secret: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
