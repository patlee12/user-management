import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

/**
 * Data transfer object used to validate a password reset token.
 * The client sends the token from the reset link and their userId to verify if the request is valid.
 */
export class ValidatePasswordResetDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The ID of the user requesting the password reset validation',
    example: 42,
  })
  userId: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The raw token received in the reset password email',
  })
  token: string;
}
