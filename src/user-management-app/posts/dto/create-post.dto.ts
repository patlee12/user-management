import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

/**
 * Data transfer object used to create a new post.
 */
export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @ApiProperty({ required: true })
  title: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  body: string;

  @ApiProperty({ required: false, default: false })
  published?: boolean;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  authorId: number;
}
