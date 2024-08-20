import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { PostsModule } from './posts.module';
import { PrismaService } from 'src/services/prisma.service';

describe('PostsService', () => {
  let service: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PostsModule],
      providers: [PostsService, PrismaService],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
