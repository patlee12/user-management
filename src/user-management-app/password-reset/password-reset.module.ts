import { Module } from '@nestjs/common';
import { PasswordResetService } from './password-reset.service';
import { PasswordResetController } from './password-reset.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersService } from '../users/users.service';
import { RolesPermissionsResourcesService } from '../roles-and-permissions-resources/roles-permissions-resources.service';
import { MailingService } from '../mailing/mailing.service';

@Module({
  controllers: [PasswordResetController],
  providers: [
    PasswordResetService,
    UsersService,
    RolesPermissionsResourcesService,
    MailingService,
  ],
  imports: [PrismaModule],
})
export class PasswordResetModule {}
