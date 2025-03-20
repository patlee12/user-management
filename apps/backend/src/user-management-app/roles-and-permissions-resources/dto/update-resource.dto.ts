import { PartialType } from '@nestjs/swagger';
import { CreateResourceDto } from './create-resource.dto';

/**
 * Update Resource Data transfer object.
 */
export class UpdateResourceDto extends PartialType(CreateResourceDto) {}
