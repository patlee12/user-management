import { Test, TestingModule } from '@nestjs/testing';
import { RolesAndPermissionsController } from './roles-and-permissions.controller';
import { RolesAndPermissionsService } from './roles-and-permissions.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('RolesAndPermissionsController', () => {
  let controller: RolesAndPermissionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesAndPermissionsController],
      providers: [RolesAndPermissionsService, PrismaService],
    }).compile();

    controller = module.get<RolesAndPermissionsController>(
      RolesAndPermissionsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
