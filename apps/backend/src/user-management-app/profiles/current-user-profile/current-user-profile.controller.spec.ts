import { Test, TestingModule } from '@nestjs/testing';
import { CurrentUserProfileController } from './current-user-profile.controller';

describe('CurrentUserProfileController', () => {
  let controller: CurrentUserProfileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CurrentUserProfileController],
    }).compile();

    controller = module.get<CurrentUserProfileController>(CurrentUserProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
