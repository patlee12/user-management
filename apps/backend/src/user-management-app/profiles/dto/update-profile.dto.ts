import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, ValidateIf } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((o) => o.name !== null)
  @IsString()
  name?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((o) => o.role !== null)
  @IsString()
  role?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((o) => o.bio !== null)
  @IsString()
  bio?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((o) => o.location !== null)
  @IsString()
  location?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((o) => o.experience !== null)
  @IsString()
  experience?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((o) => o.github !== null)
  @IsString()
  github?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((o) => o.website !== null)
  @IsUrl()
  website?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((o) => o.avatarUrl !== null)
  @IsUrl()
  avatarUrl?: string | null;
}
