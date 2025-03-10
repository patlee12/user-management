import { PasswordReset } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class PasswordResetEntity implements PasswordReset {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @Exclude()
  @ApiProperty()
  token: string;

  @ApiProperty()
  expiresAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
