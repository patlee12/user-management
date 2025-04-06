import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO used to verify an account request. It includes:
 * - tokenId: a short ID used to locate the account request.
 * - providedToken: the raw token the user received via email.
 */
export class VerifyAccountRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description:
      'The token ID used to find the account request in the database',
    example: 'a1b2c3d4e5f6g7h8',
  })
  tokenId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description:
      'The full raw token sent in the email, verified against the hashed token in the DB',
    example: 'Xyz123...tokenValueHere...',
  })
  providedToken: string;
}
