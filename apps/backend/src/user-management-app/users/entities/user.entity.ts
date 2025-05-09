import { LoginType, User } from '@prisma/client';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

/**
 * Represents a user in the system.
 * Excludes sensitive fields like password and email MFA temp codes from API responses.
 */
export class UserEntity implements User {
  @ApiProperty()
  id: number;

  @ApiProperty({ required: true, nullable: false })
  username: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: true, nullable: false })
  email: string | null;

  @Exclude()
  @ApiHideProperty()
  password: string;

  @ApiProperty()
  mfaEnabled: boolean;

  @ApiProperty()
  emailVerified: boolean;

  @Exclude()
  @ApiHideProperty()
  emailMfaTempCode: string | null;

  @Exclude()
  @ApiHideProperty()
  emailMfaTempExpiresAt: Date;

  @ApiProperty({ required: false, nullable: true })
  userRoles?: number[];

  @ApiProperty()
  loginType: LoginType;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
