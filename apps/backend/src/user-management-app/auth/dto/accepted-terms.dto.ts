import { ApiProperty } from '@nestjs/swagger';
import { Equals, IsBoolean, IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO used to confirm acceptance of Terms of Use.
 */
export class AcceptTermsDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description:
      'Temporary JWT ticket authorizing the user to accept the latest terms',
  })
  ticket: string;

  @IsBoolean()
  @IsNotEmpty()
  @Equals(true)
  @ApiProperty({
    description: 'Must explicitly confirm terms acceptance by setting to true',
  })
  accepted: boolean;
}
