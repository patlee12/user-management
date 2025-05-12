import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/user-management-app/auth/guards/jwt-auth.guard';
import { ProfileEntity } from '../entities/profile.entity';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ProfilesService } from '../profiles.service';
import { plainToInstance } from 'class-transformer';

@Controller('user/profile')
@UseGuards(JwtAuthGuard)
@ApiTags('profile')
@ApiBearerAuth()
export class CurrentUserProfileController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  @ApiOkResponse({ type: ProfileEntity })
  async getOwnProfile(@Req() req) {
    const profile = await this.profilesService.getProfile(req.user.userId);
    return plainToInstance(ProfileEntity, profile);
  }

  @Put()
  @ApiOkResponse({ type: ProfileEntity })
  async updateOwnProfile(@Req() req, @Body() dto: UpdateProfileDto) {
    const updated = await this.profilesService.updateProfile(
      req.user.userId,
      dto,
    );
    return plainToInstance(ProfileEntity, updated);
  }
}
