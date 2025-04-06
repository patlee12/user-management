import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  Length,
} from 'class-validator';
import { AtLeastOneField } from '@src/common/Decorators/atleast-one-field-constraint';

/**
 * Data transfer object passed to server to log user in and provide access token JWT on successful login.
 */
@AtLeastOneField(['email', 'username'], {
  message: 'Either email or username must be provided',
})
export class LoginDto {
  @IsString()
  @MinLength(3)
  @IsOptional()
  @ApiPropertyOptional()
  username?: string;

  @IsEmail()
  @IsOptional()
  @ApiPropertyOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(12)
  @ApiProperty()
  password: string;

  @IsString()
  @IsOptional()
  @Length(6, 6)
  @ApiPropertyOptional()
  token?: string;
}
