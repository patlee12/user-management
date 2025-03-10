import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from 'src/user-management-app/users/users.module';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from 'src/user-management-app/auth/auth.module';
import { RolesPermissionsResourcesModule } from './roles-and-permissions-resources/roles-permissions-resources.module';
import { AccountRequestsModule } from './account-requests/account-requests.module';
import { PasswordResetModule } from './password-reset/password-reset.module';
@Module({
  imports: [
    AuthModule,
    PrismaModule,
    AccountRequestsModule,
    PasswordResetModule,
    UsersModule,
    PostsModule,
    RolesPermissionsResourcesModule,
  ],
  controllers: [],
  providers: [],
})
export class UserManagementModule {}
