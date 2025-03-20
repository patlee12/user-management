import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { RolesPermissionsResourcesService } from '../roles-and-permissions-resources/roles-permissions-resources.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, RolesPermissionsResourcesService],
  imports: [PrismaModule],
  exports: [UsersService],
})
export class UsersModule {}
