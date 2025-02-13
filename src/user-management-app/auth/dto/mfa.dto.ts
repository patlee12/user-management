import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class MfaDto {
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  @ApiProperty()
  token: string;
}
