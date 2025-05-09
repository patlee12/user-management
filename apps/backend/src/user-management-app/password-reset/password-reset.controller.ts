import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PasswordResetService } from './password-reset.service';
import { CreatePasswordResetDto } from './dto/create-password-reset.dto';
import { UpdatePasswordResetDto } from './dto/update-password-reset.dto';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PasswordResetEntity } from './entities/password-reset.entity';
import { ConfirmPasswordResetDto } from './dto/confirm-password-reset.dto';
import { UserEntity } from '../users/entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles-and-permissions-resources/roles.guard';
import { Roles } from '../roles-and-permissions-resources/roles.decorator';
import { Throttle } from '@nestjs/throttler';
import { PASSWORD_RESET_THROTTLE } from 'src/common/constraints';
import { ValidatePasswordResetDto } from './dto/validate-password-reset.dto';

@Controller('password-reset')
@ApiTags('password-reset')
export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @Post()
  @Throttle(PASSWORD_RESET_THROTTLE)
  @ApiCreatedResponse({ type: PasswordResetEntity })
  async create(
    @Body() createPasswordResetDto: CreatePasswordResetDto,
  ): Promise<PasswordResetEntity> {
    const newPasswordReset = await this.passwordResetService.create(
      createPasswordResetDto,
    );
    return plainToInstance(PasswordResetEntity, newPasswordReset);
  }

  @Post('validate')
  @Throttle(PASSWORD_RESET_THROTTLE)
  @ApiOkResponse({ type: PasswordResetEntity })
  async validateResetToken(
    @Body() validatePasswordResetDto: ValidatePasswordResetDto,
  ): Promise<PasswordResetEntity> {
    const reset = await this.passwordResetService.validateResetToken(
      validatePasswordResetDto,
    );
    return plainToInstance(PasswordResetEntity, reset);
  }

  @Post('confirm')
  @Throttle(PASSWORD_RESET_THROTTLE)
  @ApiCreatedResponse({ type: UserEntity })
  async confirmPasswordReset(
    @Body() confirmPasswordResetDto: ConfirmPasswordResetDto,
  ): Promise<UserEntity> {
    const confirmPasswordReset =
      await this.passwordResetService.confirmPasswordReset(
        confirmPasswordResetDto,
      );
    return plainToInstance(UserEntity, confirmPasswordReset);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('Admin')
  @ApiOkResponse({ type: PasswordResetEntity, isArray: true })
  async findAll(): Promise<PasswordResetEntity[]> {
    const allPasswordResets = await this.passwordResetService.findAll();
    return plainToInstance(PasswordResetEntity, allPasswordResets);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('Admin')
  @ApiOkResponse({ type: PasswordResetEntity })
  async findOne(@Param('id') id: string): Promise<PasswordResetEntity> {
    const passwordReset = await this.passwordResetService.findOne(+id);
    return plainToInstance(PasswordResetEntity, passwordReset);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('Admin')
  @ApiOkResponse({ type: PasswordResetEntity })
  async update(
    @Param('id') id: string,
    @Body() updatePasswordResetDto: UpdatePasswordResetDto,
  ): Promise<PasswordResetEntity> {
    const updatePasswordReset = await this.passwordResetService.update(
      +id,
      updatePasswordResetDto,
    );
    return plainToInstance(PasswordResetEntity, updatePasswordReset);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('Admin')
  @ApiOkResponse({ type: PasswordResetEntity })
  async remove(@Param('id') id: string): Promise<PasswordResetEntity> {
    const removePasswordReset = await this.passwordResetService.remove(+id);
    return plainToInstance(PasswordResetEntity, removePasswordReset);
  }
}
