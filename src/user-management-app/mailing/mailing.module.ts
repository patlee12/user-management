import { Module } from '@nestjs/common';
import { MailService } from './mailing.service';
import { MailingController } from './mailing.controller';

@Module({
  controllers: [MailingController],
  providers: [MailService],
})
export class MailingModule {}
