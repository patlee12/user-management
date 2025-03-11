import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MailingService } from './mailing.service';
import { EmailVerificationDto } from './dto/email-verification.dto';
import { EmailPasswordResetDto } from './dto/email-password-reset.dto';

@ApiTags('mailing')
@Controller('mailing')
export class MailingController {
  private logger = new Logger(MailingController.name);

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
    this.logger.log(
      `Sending verification email to ${emailVerificationDto.email}`,
    );
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
    this.logger.log(
      `Sending password reset email to ${emailPasswordResetDto.email}`,
    );
    await this.mailingService.sendPasswordResetEmail(emailPasswordResetDto);
    return { message: 'Password reset email sent successfully' };
  }
}
