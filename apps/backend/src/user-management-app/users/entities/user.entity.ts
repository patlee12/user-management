import { User } from '@prisma/client';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

/**
 * Represents a user in the system.
 * Excludes the 'password' field from API responses for security.
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

  @ApiProperty({ required: false, nullable: true })
  userRoles?: number[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
