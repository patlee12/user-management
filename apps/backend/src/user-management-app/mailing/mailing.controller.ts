import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { RolesGuard } from '../roles-and-permissions-resources/roles.guard';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MailingService } from './mailing.service';
import { EmailVerificationDto } from './dto/email-verification.dto';
import { EmailPasswordResetDto } from './dto/email-password-reset.dto';
import { GLOBAL_THROTTLE_CONFIG } from 'src/common/constraints';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../roles-and-permissions-resources/roles.decorator';
import { EmailMfaCodeDto } from './dto/email-mfa-code.dto';

@ApiTags('mailing')
@Controller('mailing')
@Throttle(GLOBAL_THROTTLE_CONFIG)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
@ApiBearerAuth()
export class MailingController {
  constructor(private readonly mailingService: MailingService) {}

  @Post('verification')
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

  @Post('reset')
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

  @Post('mfa')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send login MFA email code.' })
  @ApiResponse({
    status: 200,
    description: 'Email MFA code sent successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async sendEmailMfaCode(
    @Body() emailMfaCodeDto: EmailMfaCodeDto,
  ): Promise<{ message: string }> {
    await this.mailingService.sendEmailMfaCode(emailMfaCodeDto);
    return { message: 'Email MFA code sent successfully' };
  }
}
