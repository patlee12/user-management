import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../../prisma/prisma.module';
import { UsersModule } from 'src/user-management-app/users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { MailingService } from '../mailing/mailing.service';
import { JWT_SECRET } from '@src/common/constants/environment';

export const ENABLE_OAUTH = process.env.ENABLE_OAUTH === 'true';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: '30m' },
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    MailingService,
    ...(ENABLE_OAUTH ? [GoogleStrategy] : []),
  ],
})
export class AuthModule {}
