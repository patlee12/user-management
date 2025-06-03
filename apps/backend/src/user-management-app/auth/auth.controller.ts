import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Response, Request as ExpressRequest } from 'express';
import {
  ApiOkResponse,
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { plainToInstance } from 'class-transformer';

import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { MfaDto } from './dto/mfa.dto';
import { AcceptTermsDto } from './dto/accepted-terms.dto';
import { MfaResponseDto } from './dto/mfa-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersService } from 'src/user-management-app/users/users.service';
import { UserEntity } from 'src/user-management-app/users/entities/user.entity';
import { LOGIN_THROTTLE } from 'src/common/constraints';
import { JwtService } from '@nestjs/jwt';
import getCookieOptions from './helpers/get-cookie-options';
import { EmailMfaDto } from './dto/email-mfa.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { OAuthPayload } from './interfaces/oauth-payload.interface';
import { FRONTEND_URL, isProd } from '@src/common/constants/environment';

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
      res.cookie(
        'access_token',
        result.accessToken,
        getCookieOptions(true, isProd),
      );
      const user = loginDto.email
        ? await this.userService.findOneByEmail(loginDto.email)
        : await this.userService.findOneByUsername(loginDto.username);
      const publicToken = this.authService.generatePublicSessionToken(user.id);
      res.cookie(
        'public_session',
        publicToken,
        getCookieOptions(false, isProd),
      );
    }

    if ('ticket' in result) {
      res.cookie('mfa_ticket', result.ticket, getCookieOptions(true, isProd));
    }

    return result;
  }

  @Get('google')
  @Throttle(LOGIN_THROTTLE)
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Redirect to Google for OAuth login' })
  googleAuth() {}

  @Get('google/callback')
  @Throttle(LOGIN_THROTTLE)
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(
    @Req() req: ExpressRequest & { user?: OAuthPayload; query: any },
    @Res() res: Response,
  ): Promise<void> {
    if (!req.user) {
      console.error('Google Auth Error: No user in request');
      return res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
    }

    try {
      const result = await this.authService.loginWithOAuth(req.user);
      const uri = new URL(`${FRONTEND_URL}/login`);
      // preserve any frontend redirect
      const raw = Array.isArray(req.query.redirect)
        ? req.query.redirect[0]
        : req.query.redirect;
      if (raw) uri.searchParams.set('redirect', raw.toString());

      if ('accessToken' in result) {
        res.cookie(
          'access_token',
          result.accessToken,
          getCookieOptions(true, isProd),
        );
        const { userId } = await this.jwtService.verifyAsync<{
          userId: number;
        }>(result.accessToken);
        res.cookie(
          'public_session',
          this.authService.generatePublicSessionToken(userId),
          getCookieOptions(false, isProd),
        );
      }

      // If MFA is required, pass it as query params
      if ('ticket' in result && 'mfaRequired' in result) {
        uri.searchParams.set('mfaRequired', 'true');
        uri.searchParams.set('ticket', result.ticket);
      }
      if ('ticket' in result && 'termsRequired' in result) {
        uri.searchParams.set('termsRequired', 'true');
        uri.searchParams.set('ticket', result.ticket);
      }

      return res.redirect(uri.toString());
    } catch (err: any) {
      console.error('Google Auth Error:', err?.message || err);
      return res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
    }
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
      res.cookie(
        'access_token',
        result.accessToken,
        getCookieOptions(true, isProd),
      );
      const payload = await this.jwtService.verifyAsync<{
        userId: number | string;
        purpose: string;
      }>(mfaDto.ticket);
      const publicToken = this.authService.generatePublicSessionToken(
        +payload.userId,
      );
      res.cookie(
        'public_session',
        publicToken,
        getCookieOptions(false, isProd),
      );
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
      res.cookie(
        'access_token',
        result.accessToken,
        getCookieOptions(true, isProd),
      );
      const { userId } = await this.jwtService.verifyAsync<{ userId: number }>(
        result.accessToken,
      );
      const publicToken = this.authService.generatePublicSessionToken(userId);
      res.cookie(
        'public_session',
        publicToken,
        getCookieOptions(false, isProd),
      );
    }

    return result;
  }

  @Post('setup-mfa')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Generate MFA secret and QR code for user setup.',
    description:
      'Returns the MFA secret and QR code image to register with an authenticator app.',
  })
  @ApiOkResponse({ type: MfaResponseDto })
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

  @Post('accept-terms')
  @Throttle(LOGIN_THROTTLE)
  @ApiOperation({
    summary: 'Accept Terms of Use using a valid ticket',
    description:
      'Accepts the Terms of Use using a temporary JWT ticket. Returns an access token if valid.',
  })
  @ApiOkResponse({ type: AuthResponseDto })
  async acceptTerms(
    @Body() dto: AcceptTermsDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.acceptTerms(dto);

    if ('accessToken' in result) {
      res.cookie(
        'access_token',
        result.accessToken,
        getCookieOptions(true, isProd),
      );
      const { userId } = await this.jwtService.verifyAsync<{ userId: number }>(
        result.accessToken,
      );
      res.cookie(
        'public_session',
        this.authService.generatePublicSessionToken(userId),
        getCookieOptions(false, isProd),
      );
    }

    return result;
  }

  @Post('logout')
  @Throttle(LOGIN_THROTTLE)
  @ApiOperation({ summary: 'Log out by clearing the auth cookies' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', getCookieOptions(true, isProd, true));
    res.clearCookie('public_session', getCookieOptions(false, isProd, true));
    res.clearCookie('mfa_ticket', getCookieOptions(true, isProd, true));
    return { success: true };
  }
}
