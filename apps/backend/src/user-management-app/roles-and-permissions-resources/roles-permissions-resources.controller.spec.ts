import { Test, TestingModule } from '@nestjs/testing';
import { RolesPermissionsResourcesController } from './roles-permissions-resources.controller';
import { RolesPermissionsResourcesService } from './roles-permissions-resources.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('RolesPermissionsResourcesController', () => {
  let controller: RolesPermissionsResourcesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesPermissionsResourcesController],
      providers: [RolesPermissionsResourcesService, PrismaService],
    }).compile();

    controller = module.get<RolesPermissionsResourcesController>(
      RolesPermissionsResourcesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
