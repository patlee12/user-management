import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MailingService } from './mailing.service';
import { EmailVerificationDto } from './dto/email-verification.dto';
import { EmailPasswordResetDto } from './dto/email-password-reset.dto';
import { GLOBAL_THROTTLE_CONFIG } from 'src/common/constraints';

@ApiTags('mailing')
@Controller('mailing')
@Throttle(GLOBAL_THROTTLE_CONFIG)
export class MailingController {
  constructor(private readonly mailingService: MailingService) {}

  @Post('send-verification-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send verification email with link.' })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async sendVerificationEmail(
    @Body() emailVerificationDto: EmailVerificationDto,
  ): Promise<{ message: string }> {
    await this.mailingService.sendVerificationEmail(emailVerificationDto);
    return { message: 'Verification email sent successfully' };
  }

  @Post('send-password-reset-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send password reset email with link.' })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async sendPasswordResetEmail(
    @Body() emailPasswordResetDto: EmailPasswordResetDto,
  ): Promise<{ message: string }> {
    await this.mailingService.sendPasswordResetEmail(emailPasswordResetDto);
    return { message: 'Password reset email sent successfully' };
  }
}
