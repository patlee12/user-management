import { Test, TestingModule } from '@nestjs/testing';
import { AccountRequestsController } from './account-requests.controller';
import { AccountRequestsService } from './account-requests.service';

describe('AccountRequestsController', () => {
  let controller: AccountRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountRequestsController],
      providers: [AccountRequestsService],
    }).compile();

    controller = module.get<AccountRequestsController>(
      AccountRequestsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
