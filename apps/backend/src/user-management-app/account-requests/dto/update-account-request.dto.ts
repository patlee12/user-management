import { PartialType } from '@nestjs/swagger';
import { CreateAccountRequestDto } from './create-account-request.dto';

/**
 * Data transfer object used to update an account request.
 */
export class UpdateAccountRequestDto extends PartialType(
  CreateAccountRequestDto,
) {}
