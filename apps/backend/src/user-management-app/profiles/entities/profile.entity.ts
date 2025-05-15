import { Profile } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ProfileEntity implements Profile {
  @ApiProperty()
  name: string;

  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  avatarUrl: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  bio: string;

  @ApiProperty()
  location: string;

  @ApiProperty()
  experience: string;

  @ApiProperty()
  github: string;

  @ApiProperty()
  website: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
