import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from 'src/user-management-app/users/users.module';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from 'src/user-management-app/auth/auth.module';
import { RolesAndPermissionsModule } from 'src/user-management-app/roles-and-permissions/roles-and-permissions.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    PostsModule,
    AuthModule,
    RolesAndPermissionsModule,
  ],
  controllers: [],
  providers: [],
})
export class UserManagementModule {}
