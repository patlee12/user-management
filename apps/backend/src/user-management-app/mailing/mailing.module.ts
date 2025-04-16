import { Module } from '@nestjs/common';
import { MailingService } from './mailing.service';
import { MailingController } from './mailing.controller';
import { RolesPermissionsResourcesService } from '../roles-and-permissions-resources/roles-permissions-resources.service';

@Module({
  controllers: [MailingController],
  providers: [MailingService, RolesPermissionsResourcesService],
})
export class MailingModule {}
