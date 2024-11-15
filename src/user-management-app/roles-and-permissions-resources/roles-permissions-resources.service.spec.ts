import { Test, TestingModule } from '@nestjs/testing';
import { RolesPermissionsResourcesService } from './roles-permissions-resources.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('RolesAndPermissionsService', () => {
  let service: RolesPermissionsResourcesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesPermissionsResourcesService, PrismaService],
    }).compile();

    service = module.get<RolesPermissionsResourcesService>(
      RolesPermissionsResourcesService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
