import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Matches,
  IsEmail,
  IsBoolean,
  IsDate,
} from 'class-validator';
import { UserRolesDto } from 'src/user-management-app/roles-and-permissions-resources/dto/user-roles.dto';
import { Transform, Type } from 'class-transformer';

/**
 * Data transfer object used to create a unique user in database.
 */
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @Transform(({ value }) => value.toLowerCase())
  @ApiProperty()
  username: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @ApiProperty({ required: false })
  name?: string;

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  @ApiProperty()
  password: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false })
  mfaEnabled?: boolean;

  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  @ApiProperty()
  email: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false })
  emailVerified?: boolean;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  @ApiPropertyOptional({
    description: 'DateTime when user accepted Terms of Use',
  })
  acceptedTermsAt?: Date;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Version of the Terms of Use the user accepted',
  })
  termsVersion?: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    type: [UserRolesDto],
    description: 'Array of UserRoles associated with the user',
    required: false,
  })
  userRoles?: UserRolesDto[];
}
