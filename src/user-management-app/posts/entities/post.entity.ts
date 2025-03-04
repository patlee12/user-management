import { Post } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from 'src/user-management-app/users/entities/user.entity';
import { plainToInstance, Transform } from 'class-transformer';

/**
 * Represents a Post entity used for API responses in a NestJS application. Uses Transform to ensure proper
 * serialization while excluding sensitive fields (e.g., password).
 */
export class PostEntity implements Post {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false, nullable: true })
  description: string | null;

  @ApiProperty()
  body: string;

  @ApiProperty()
  published: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: true })
  authorId: number;

  @ApiProperty({ required: false, type: UserEntity })
  @Transform(({ value }) => plainToInstance(UserEntity, value), {
    toClassOnly: true,
  })
  author?: UserEntity;
}
