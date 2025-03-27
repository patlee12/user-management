import { PasswordReset } from '@prisma/client';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class PasswordResetEntity implements PasswordReset {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @Exclude()
  @ApiHideProperty()
  token: string;

  @ApiProperty()
  expiresAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
