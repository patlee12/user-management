import { PartialType } from '@nestjs/swagger';
import { CreateAccountRequestDto } from './create-account-request.dto';

export class UpdateAccountRequestDto extends PartialType(
  CreateAccountRequestDto,
) {}
