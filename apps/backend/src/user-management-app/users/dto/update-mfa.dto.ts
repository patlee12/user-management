import { PartialType } from '@nestjs/swagger';
import { CreateMfaDto } from './create-mfa.dto';

/**
 * Data transfer object used to update Mfa entry for a given user in the database.
 */
export class UpdateMfaDto extends PartialType(CreateMfaDto) {}
