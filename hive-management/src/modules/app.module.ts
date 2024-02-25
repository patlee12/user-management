import { Module } from '@nestjs/common';
import { AppController } from '../controllers/app.controller';
import { AppService } from '../services/app.service';
import { PrismaModule } from './prisma.module';
import { UsersModule } from 'src/users/users.module';
import { PostsModule } from 'src/posts/posts.module';

@Module({
  imports: [PrismaModule, UsersModule, PostsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
