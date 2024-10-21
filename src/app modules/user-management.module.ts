import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { PostsModule } from 'src/posts/posts.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, UsersModule, PostsModule, AuthModule],
  controllers: [],
  providers: [],
})
export class UserManagementModule {}
