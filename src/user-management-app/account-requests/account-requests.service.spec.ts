import { Test, TestingModule } from '@nestjs/testing';
import { AccountRequestsService } from './account-requests.service';

describe('AccountRequestsService', () => {
  let service: AccountRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountRequestsService],
    }).compile();

    service = module.get<AccountRequestsService>(AccountRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
