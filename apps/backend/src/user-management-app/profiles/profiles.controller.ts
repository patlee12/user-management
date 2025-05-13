import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileEntity } from './entities/profile.entity';
import { JwtAuthGuard } from '@src/user-management-app/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles-and-permissions-resources/roles.guard';
import { Roles } from '../roles-and-permissions-resources/roles.decorator';
import { plainToInstance } from 'class-transformer';

@Controller('profiles')
@ApiTags('profiles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get(':userId')
  @ApiOkResponse({ type: ProfileEntity })
  async findOne(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<ProfileEntity> {
    const profile = await this.profilesService.getProfile(userId);
    return plainToInstance(ProfileEntity, profile);
  }

  @Patch(':userId')
  @ApiOkResponse({ type: ProfileEntity })
  async update(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdateProfileDto,
  ): Promise<ProfileEntity> {
    const updated = await this.profilesService.updateProfile(userId, dto);
    return plainToInstance(ProfileEntity, updated);
  }
}
