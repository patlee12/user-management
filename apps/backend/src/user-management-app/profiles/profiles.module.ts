import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { CurrentUserProfileController } from './current-user-profile/current-user-profile.controller';

@Module({
  controllers: [ProfilesController, CurrentUserProfileController],
  providers: [ProfilesService],
})
export class ProfilesModule {}
