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
      'Returns an access token if MFA is not enabled or the token is valid. If MFA is enabled and no token is provided, returns a temporary ticket for completing the MFA challenge. Use Admin Email and password from .env files if you need an account.',
  })
  @ApiOkResponse({ type: AuthResponseDto })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.login(loginDto);
    const isProd = process.env.NODE_ENV?.toLowerCase() === 'production';

    if ('accessToken' in result) {
      res.cookie('access_token', result.accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        path: '/',
        maxAge: 1000 * 60 * 30,
      });
      let user = null;
      if (loginDto.email && loginDto.email.trim() !== '') {
        user = await this.userService.findOneByEmail(loginDto.email);
      } else {
        user = await this.userService.findOneByUsername(loginDto.username);
      }
      const publicToken = this.authService.generatePublicSessionToken(user.id);

      res.cookie('public_session', publicToken, {
        httpOnly: false,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        path: '/',
        maxAge: 1000 * 60 * 30,
      });
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
    const isProd = process.env.NODE_ENV?.toLowerCase() === 'production';

    if ('accessToken' in result) {
      res.cookie('access_token', result.accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        path: '/',
        maxAge: 1000 * 60 * 30,
      });

      const payload = await this.jwtService.verifyAsync<{
        userId: number | string;
        purpose: string;
      }>(mfaDto.ticket);

      const publicToken = await this.authService.generatePublicSessionToken(
        +payload.userId,
      );

      res.cookie('public_session', publicToken, {
        httpOnly: false,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        path: '/',
        maxAge: 1000 * 60 * 30,
      });
    }

    return result;
  }

  @Post('setup-mfa')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Generate MFA secret and QR code for user setup.',
    description:
      'Returns the MFA secret and QR code image to register with an authenticator app. You must be logged in (JWT).',
  })
  @ApiOkResponse({ type: MfaResponseDto })
  @UseGuards(JwtAuthGuard)
  async setupMfa(@Request() req): Promise<MfaResponseDto> {
    const user: UserEntity = req.user;
    if (!user.mfaEnabled) {
      const secret = await this.authService.generateMfaSecret(user);
      await this.userService.createMfaAuth({
        secret,
        userId: user.id,
        email: user.email,
      });
      const qrCode = await this.authService.generateQrCode(user, secret);
      const mfaResponseDto: MfaResponseDto = { qrCode, secret };
      return mfaResponseDto;
    } else {
      throw new UnauthorizedException('User account already has MFA enabled.');
    }
  }

  @Post('confirm-mfa')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Confirm MFA token and activate MFA on account.',
    description:
      "Verifies the user's 6-digit MFA token during setup and enables MFA if valid. Requires JWT.",
  })
  @UseGuards(JwtAuthGuard)
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
    const isProd = process.env.NODE_ENV?.toLowerCase() === 'production';
    await res.clearCookie('access_token', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
    });
    await res.clearCookie('public_session', {
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
    });
    return { message: 'Logged out successfully' };
  }
}
