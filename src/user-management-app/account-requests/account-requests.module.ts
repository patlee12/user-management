import { Module } from '@nestjs/common';
import { AccountRequestsService } from './account-requests.service';
import { AccountRequestsController } from './account-requests.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RolesPermissionsResourcesService } from '../roles-and-permissions-resources/roles-permissions-resources.service';

@Module({
  controllers: [AccountRequestsController],
  imports: [PrismaModule],
  providers: [AccountRequestsService, RolesPermissionsResourcesService],
})
export class AccountRequestsModule {}
