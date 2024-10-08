import {
  Body,
  Controller,
  Post,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthEntity } from './entity/auth.entity';
import { LoginDto } from './dto/login.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from 'src/users/users.service';
import { UserEntity } from 'src/users/entities/user.entity';
@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Post('login')
  @ApiOkResponse({ type: AuthEntity })
  login(@Body() { email, password }: LoginDto) {
    return this.authService.login(email, password);
  }

  @Post('setup-mfa')
  @UseGuards(JwtAuthGuard)
  async setupMfa(@Request() req) {
    const user: UserEntity = req.user;
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
