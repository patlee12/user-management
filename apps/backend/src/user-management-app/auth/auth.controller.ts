import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { plainToInstance } from 'class-transformer';

import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { MfaDto } from './dto/mfa.dto';
import { MfaResponseDto } from './dto/mfa-response.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from 'src/user-management-app/users/users.service';
import { UserEntity } from 'src/user-management-app/users/entities/user.entity';
import { LOGIN_THROTTLE } from 'src/common/constraints';
import { JwtService } from '@nestjs/jwt';
import getCookieOptions from './helpers/get-cookie-options';
import { EmailMfaDto } from './dto/email-mfa.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  @Throttle(LOGIN_THROTTLE)
  @ApiOperation({
    summary: 'Login with email/username and password and optionally MFA token.',
    description:
      'Returns an access token if MFA is not enabled or the token is valid. If MFA is enabled and no token is provided, returns a temporary ticket for completing the MFA challenge.',
  })
  @ApiOkResponse({ type: AuthResponseDto })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.login(loginDto);

    if ('accessToken' in result) {
      res.cookie('access_token', result.accessToken, getCookieOptions(true));

      const user = loginDto.email
        ? await this.userService.findOneByEmail(loginDto.email)
        : await this.userService.findOneByUsername(loginDto.username);

      const publicToken = this.authService.generatePublicSessionToken(user.id);
      res.cookie('public_session', publicToken, getCookieOptions(false));
    }

    return result;
  }

  @Post('verify-mfa')
  @Throttle(LOGIN_THROTTLE)
  @ApiOperation({
    summary: 'Verify MFA ticket + 6-digit token to complete login.',
    description:
      'Use this endpoint after receiving a `ticket` from /login if MFA was required. Returns a final access token if the token is valid.',
  })
  @ApiOkResponse({ type: AuthResponseDto })
  async verifyMfaTicket(
    @Body() mfaDto: MfaDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.verifyMfaTicket(mfaDto);

    if ('accessToken' in result) {
      res.cookie('access_token', result.accessToken, getCookieOptions(true));

      const payload = await this.jwtService.verifyAsync<{
        userId: number | string;
        purpose: string;
      }>(mfaDto.ticket);

      const publicToken = await this.authService.generatePublicSessionToken(
        +payload.userId,
      );
      res.cookie('public_session', publicToken, getCookieOptions(false));
    }

    return result;
  }

  @Post('verify-email-mfa')
  @Throttle(LOGIN_THROTTLE)
  @ApiOperation({
    summary: 'Verify 6-digit email MFA code to complete login.',
    description:
      'Use this after login when the response has `emailMfaRequired: true`. This endpoint verifies the email and code and issues a final access token.',
  })
  @ApiOkResponse({ type: AuthResponseDto })
  async verifyEmailMfa(
    @Body() emailMfaDto: EmailMfaDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.verifyEmailMfaCode(emailMfaDto);

    if ('accessToken' in result) {
      res.cookie('access_token', result.accessToken, getCookieOptions(true));

      const publicToken = await this.authService.generatePublicSessionToken(
        (await this.jwtService.verifyAsync(result.accessToken)).userId,
      );
      res.cookie('public_session', publicToken, getCookieOptions(false));
    }

    return result;
  }

  @Post('setup-mfa')
  @ApiBearerAuth()
  @ApiOkResponse({ type: MfaResponseDto })
  @ApiOperation({
    summary: 'Generate MFA secret and QR code for user setup.',
    description:
      'Returns the MFA secret and QR code image to register with an authenticator app.',
  })
  @UseGuards(JwtAuthGuard)
  async setupMfa(@Request() req): Promise<MfaResponseDto> {
    const user: UserEntity = req.user;
    if (user.mfaEnabled) {
      throw new UnauthorizedException('User account already has MFA enabled.');
    }

    const secret = await this.authService.generateMfaSecret(user);
    await this.userService.createMfaAuth({
      secret,
      userId: user.id,
      email: user.email,
    });
    const qrCode = await this.authService.generateQrCode(user, secret);
    return { qrCode, secret };
  }

  @Post('confirm-mfa')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Confirm MFA token and activate MFA on account.',
    description:
      "Verifies the user's 6-digit MFA token during setup and enables MFA if valid.",
  })
  async confirmMfa(@Request() req, @Body() mfaDto: MfaDto): Promise<boolean> {
    return this.authService.confirmMfa(req.user, mfaDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the currently authenticated user' })
  @ApiOkResponse({ type: UserEntity })
  async getMe(@Request() req): Promise<UserEntity> {
    return plainToInstance(UserEntity, req.user);
  }

  @Post('logout')
  @Throttle(LOGIN_THROTTLE)
  @ApiOperation({ summary: 'Log out by clearing the auth cookies' })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', getCookieOptions(true));
    res.clearCookie('public_session', getCookieOptions(false));
    return { message: 'Logged out successfully' };
  }
}
