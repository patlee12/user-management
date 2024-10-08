import { PartialType } from '@nestjs/swagger';
import { CreateMfaDto } from './create-mfa.dto';

export class UpdateMfaDto extends PartialType(CreateMfaDto) {}
