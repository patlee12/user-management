import { Module } from '@nestjs/common';
import { RolesAndPermissionsService } from './roles-and-permissions.service';
import { RolesAndPermissionsController } from './roles-and-permissions.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [RolesAndPermissionsController],
  providers: [RolesAndPermissionsService],
  imports: [PrismaModule],
  exports: [RolesAndPermissionsService],
})
export class RolesAndPermissionsModule {}
