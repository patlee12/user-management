import { Test, TestingModule } from '@nestjs/testing';
import { MailingController } from './mailing.controller';
import { MailService } from './mailing.service';

describe('MailingController', () => {
  let controller: MailingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MailingController],
      providers: [MailService],
    }).compile();

    controller = module.get<MailingController>(MailingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
