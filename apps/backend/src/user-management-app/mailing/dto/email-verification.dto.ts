import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail } from 'class-validator';
import { IsLink } from 'src/common/Decorators/is-link.decorator';
import { Transform } from 'class-transformer';

/**
 * Data transfer object used to create a new verification email.
 */
export class EmailVerificationDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @IsLink({ message: 'Invalid URL format' })
  @ApiProperty()
  verifyLink: string;
}
