import { User } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class UserEntity implements User {
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id: number;

  @ApiProperty({ required: true, nullable: false })
  username: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: true, nullable: false })
  email: string | null;

  @Exclude()
  password: string;

  @ApiProperty()
  mfaEnabled: boolean;

  @ApiProperty()
  roles: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
