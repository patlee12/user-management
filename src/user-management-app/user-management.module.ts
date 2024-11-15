import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from 'src/user-management-app/users/users.module';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from 'src/user-management-app/auth/auth.module';
import { RolesPermissionsResourcesModule } from './roles-and-permissions-resources/roles-permissions-resources.module';
@Module({
  imports: [
    PrismaModule,
    UsersModule,
    PostsModule,
    AuthModule,
    RolesPermissionsResourcesModule,
  ],
  controllers: [],
  providers: [],
})
export class UserManagementModule {}
