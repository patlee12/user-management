import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

/**
 * Data transfer Object used to create a password reset.
 */
export class CreatePasswordResetDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  userId: number;
}
