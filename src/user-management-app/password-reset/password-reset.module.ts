import { Module } from '@nestjs/common';
import { PasswordResetService } from './password-reset.service';
import { PasswordResetController } from './password-reset.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersService } from '../users/users.service';

@Module({
  controllers: [PasswordResetController],
  providers: [PasswordResetService, UsersService],
  imports: [PrismaModule],
})
export class PasswordResetModule {}
