import { Module } from '@nestjs/common';
import { RolesPermissionsResourcesService } from './roles-permissions-resources.service';
import { RolesPermissionsResourcesController } from './roles-permissions-resources.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [RolesPermissionsResourcesController],
  providers: [RolesPermissionsResourcesService],
  imports: [PrismaModule],
  exports: [RolesPermissionsResourcesService],
})
export class RolesPermissionsResourcesModule {}
