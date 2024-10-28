import { ApiProperty } from '@nestjs/swagger';
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
} from 'class-validator';
import { UserRolesDto } from 'src/roles-and-permissions/dto/user-roles.dto';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @ApiProperty()
  username: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @ApiProperty({ required: false })
  name?: string;

  @IsString()
  @MinLength(12)
  @MaxLength(20)
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
  @ApiProperty()
  email: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    type: [UserRolesDto],
    description: 'Array of UserRoles associated with the user',
    required: false,
  })
  userRoles?: UserRolesDto[];
}
