import { OAuthProvider } from '../constants/oauth-providers.enum';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OAuthDto {
  @IsEnum(OAuthProvider)
  @ApiProperty({ enum: OAuthProvider })
  provider: OAuthProvider;

  @IsString()
  @ApiProperty({
    description: 'Unique ID from the OAuth provider (e.g. Google user ID)',
  })
  providerId: string;

  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  @ApiProperty({ description: 'User email returned by the OAuth provider' })
  email: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Full name returned by the OAuth provider',
  })
  name?: string;
}
