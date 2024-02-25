import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @ApiProperty()
  title: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  body: string;

  @ApiProperty({ required: false, default: false })
  published?: boolean = false;
}
