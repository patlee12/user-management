import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

/**
 * Data transfer object used to verify account request, consists of email and provided token from email service to verify a new account request.
 */
export class VerifyAccountRequestDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  providedToken: string;
}
