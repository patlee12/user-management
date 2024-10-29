import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { PostsModule } from 'src/posts/posts.module';
import { AuthModule } from 'src/auth/auth.module';
import { RolesAndPermissionsModule } from 'src/roles-and-permissions/roles-and-permissions.module';

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
