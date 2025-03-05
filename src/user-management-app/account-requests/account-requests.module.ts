import { Module } from '@nestjs/common';
import { AccountRequestsService } from './account-requests.service';
import { AccountRequestsController } from './account-requests.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [AccountRequestsController],
  imports: [PrismaModule],
  providers: [AccountRequestsService],
})
export class AccountRequestsModule {}
