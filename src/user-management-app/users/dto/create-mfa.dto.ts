import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsEmail,
  IsBase32,
} from 'class-validator';

/**
 * Data transfer object used to create a new Mfa entry in database tied to a specific user.
 */
export class CreateMfaDto {
  @IsString()
  @IsBase32()
  @IsNotEmpty()
  @ApiProperty()
  secret: string;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty()
  userId: number;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;
}
