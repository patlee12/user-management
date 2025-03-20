import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  IsNumber,
} from 'class-validator';

/**
 * Data transfer object used to confirm a password reset.
 * The client provides the token (again that was provided via email service) along with the new password.
 */
export class ConfirmPasswordResetDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description:
      'The password reset token that was sent to the user via email and verified in the first step',
  })
  token: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(12)
  @MaxLength(128)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password too weak',
  })
  @ApiProperty({
    description: 'The new password that the user wants to set',
  })
  newPassword: string;
}
