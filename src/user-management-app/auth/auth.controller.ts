import {
  Body,
  Controller,
  Post,
  Request,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiOkResponse,
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from 'src/user-management-app/users/users.service';
import { UserEntity } from 'src/user-management-app/users/entities/user.entity';
import { MfaResponseDto } from './dto/mfa-response.dto';
import { MfaDto } from './dto/mfa.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Post('login')
  @ApiOperation({
    summary: 'Login successfully and receive an access token.',
    description:
      "Copy access token and paste it in the Authorize value field (Click 'Authorize' button in top right corner of page). If you need an account use Admin Email and password from .env file.",
  })
  @ApiOkResponse({ type: AuthResponseDto })
  async login(
    @Body() { email, password, token }: LoginDto,
  ): Promise<AuthResponseDto> {
    return await this.authService.login(email, password, token);
  }

  @Post('setup-mfa')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Setup MFA with an authenticator app.',
    description:
      "Because we are using swagger module you need to copy the 'secret' in response and manually create and paste it in the authenticator app.",
  })
  @UseGuards(JwtAuthGuard)
  async setupMfa(@Request() req): Promise<MfaResponseDto> {
    const user: UserEntity = req.user;
    if (!user.mfaEnabled) {
      const secret = await this.authService.generateMfaSecret(user);
      await this.userService.createMfaAuth({
        secret: secret,
        userId: user.id,
        email: user.email,
      });
      const qrCode = await this.authService.generateQrCode(secret);
      // Return the QR code to the frontend so they can scan it with their app
      return { qrCode: qrCode, secret: secret };
    } else {
      throw new UnauthorizedException('User account has already setup MFA.');
    }
  }

  @Post('verify-mfa')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Verify MFA Token from Authenticator App',
    description:
      "Verifies a 6-digit MFA token and enables MFA for the user's account if valid.",
  })
  @UseGuards(JwtAuthGuard)
  async verifyMfa(@Request() req, @Body() { token }: MfaDto) {
    const user: UserEntity = req.user;
    const userMfa = await this.userService.findOneMfaByEmail(user.email);
    const isValid = await this.authService.verifyTotp(userMfa.secret, token);

    if (!isValid) {
      throw new UnauthorizedException('Invalid MFA code');
    }
    if (isValid) {
      await this.userService.update(user.id, { mfaEnabled: true });
    }
    // Mark the user as fully authenticated (MFA passed)
    return { message: 'MFA verified successfully' };
  }
}
