import { Resource } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Represents a resource in the system, mapped from the database Resource model.
 * Metadata for API responses.
 */
export class ResourceEntity implements Resource {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  createdBy: number;

  @ApiProperty()
  updatedBy: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
