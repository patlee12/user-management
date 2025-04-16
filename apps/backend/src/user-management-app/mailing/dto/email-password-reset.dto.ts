import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail } from 'class-validator';
import { IsLink } from 'src/common/Decorators/is-link.decorator';
import { Transform } from 'class-transformer';

/**
 * Data transfer object used to email a new password reset.
 */
export class EmailPasswordResetDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @IsLink()
  @ApiProperty()
  resetLink: string;
}
