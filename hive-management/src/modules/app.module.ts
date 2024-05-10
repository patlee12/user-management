import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma.module';
import { UsersModule } from 'src/users/users.module';
import { PostsModule } from 'src/posts/posts.module';

@Module({
  imports: [PrismaModule, UsersModule, PostsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
