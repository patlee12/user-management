import { Test, TestingModule } from '@nestjs/testing';
import { RolesAndPermissionsController } from './roles-and-permissions.controller';
import { RolesAndPermissionsService } from './roles-and-permissions.service';

describe('RolesAndPermissionsController', () => {
  let controller: RolesAndPermissionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesAndPermissionsController],
      providers: [RolesAndPermissionsService],
    }).compile();

    controller = module.get<RolesAndPermissionsController>(RolesAndPermissionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
