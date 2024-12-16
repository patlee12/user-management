import { Controller } from '@nestjs/common';
import { MailService } from './mailing.service';

@Controller('mailing')
export class MailingController {
  constructor(private readonly mailingService: MailService) {}
}
