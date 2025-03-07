import { Controller, UseGuards } from '@nestjs/common';
import { MailService } from './mailing.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('mailing')
@ApiTags('mailing')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MailingController {
  constructor(private readonly mailingService: MailService) {}
}
