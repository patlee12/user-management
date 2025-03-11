import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail } from 'class-validator';
import { IsLink } from 'src/common/Decorators/is-link.decorator';

/**
 * Data transfer object used to create a new verification email.
 */
export class EmailVerificationDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @IsLink({ message: 'Invalid URL format' })
  @ApiProperty()
  verifyLink: string;
}
