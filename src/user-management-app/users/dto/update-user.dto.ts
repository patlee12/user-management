import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

/**
 * Data transfer object used to update a user in the database.
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}
