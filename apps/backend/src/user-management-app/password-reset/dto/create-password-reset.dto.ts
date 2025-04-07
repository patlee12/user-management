import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsOptional } from 'class-validator';
import { AtLeastOneField } from '@src/common/Decorators/atleast-one-field-constraint';

/**
 * Data transfer Object used to create a password reset.
 */
@AtLeastOneField(['userId', 'email'], {
  message: 'Either userId or email must be provided',
})
export class CreatePasswordResetDto {
  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  userId?: number;

  @IsEmail()
  @IsOptional()
  @ApiPropertyOptional()
  email?: string;
}
