import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthModule } from './auth.module';
import { PrismaService } from 'src/services/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
      providers: [AuthService, PrismaService, JwtService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
