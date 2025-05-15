import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from './auth/auth.module';
import { RolesPermissionsResourcesModule } from './roles-and-permissions-resources/roles-permissions-resources.module';
import { AccountRequestsModule } from './account-requests/account-requests.module';
import { PasswordResetModule } from './password-reset/password-reset.module';
import { MailingModule } from './mailing/mailing.module';
import { ProfilesModule } from './profiles/profiles.module';

@Module({
  imports: [
    AuthModule,
    MailingModule,
    PrismaModule,
    AccountRequestsModule,
    PasswordResetModule,
    UsersModule,
    PostsModule,
    RolesPermissionsResourcesModule,
    ProfilesModule,
  ],
})
export class UserManagementModule {}
