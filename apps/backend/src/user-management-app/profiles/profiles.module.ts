import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { CurrentUserProfileController } from './current-user-profile/current-user-profile.controller';
import { RolesPermissionsResourcesService } from '../roles-and-permissions-resources/roles-permissions-resources.service';

@Module({
  controllers: [ProfilesController, CurrentUserProfileController],
  providers: [ProfilesService, RolesPermissionsResourcesService],
})
export class ProfilesModule {}
