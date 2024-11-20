import {
  Body,
  Controller,
  Post,
  Request,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthEntity } from './entity/auth.entity';
import { LoginDto } from './dto/login.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from 'src/user-management-app/users/users.service';
import { UserEntity } from 'src/user-management-app/users/entities/user.entity';
@Controller('auth')
@ApiTags('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Post('login')
  @ApiOkResponse({ type: AuthEntity })
  async login(
    @Body() { email, password, token }: LoginDto,
  ): Promise<AuthEntity> {
    return await this.authService.login(email, password, token);
  }

  @Post('setup-mfa')
  @UseGuards(JwtAuthGuard)
  async setupMfa(@Request() req): Promise<{ qrCode: string }> {
    const user: UserEntity = req.user;
    this.logger.log(`setup MFA with ${req}`);
    const secret = await this.authService.generateMfaSecret(user);
    this.userService.createMfaAuth({
      secret: secret,
      userId: user.id,
      email: user.email,
    });
    const qrCode = await this.authService.generateQrCode(secret);
    // Return the QR code to the frontend so they can scan it with their app
    return { qrCode };
  }

  @Post('verify-mfa')
  @UseGuards(JwtAuthGuard)
  async verifyMfa(@Request() req, @Body() body: { token: string }) {
    const user: UserEntity = req.user;
    this.logger.log(`Pulling user from request: ${req}`);
    const userMfa = await this.userService.findOneMfaByEmail(user.email);
    const isValid = await this.authService.verifyTotp(
      userMfa.secret,
      body.token,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid MFA code');
    }

    // Mark the user as fully authenticated (MFA passed)
    return { message: 'MFA verified successfully' };
  }
}
