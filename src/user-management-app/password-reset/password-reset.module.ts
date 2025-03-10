import { Module } from '@nestjs/common';
import { PasswordResetService } from './password-reset.service';
import { PasswordResetController } from './password-reset.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [PasswordResetController],
  providers: [PasswordResetService],
  imports: [PrismaModule],
})
export class PasswordResetModule {}
