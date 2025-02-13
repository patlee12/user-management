import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { UserManagementModule } from './user-management-app/user-management.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { PrismaClientExceptionFilter } from './prisma-client-exception/prisma-client-exception.filter';
import { runAdminSeed } from './run-admin-seed';
import { runMigrations } from './run-migrations';

async function bootstrap() {
  const userManagementApp = await NestFactory.create(UserManagementModule);

  userManagementApp.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  userManagementApp.useGlobalInterceptors(
    new ClassSerializerInterceptor(userManagementApp.get(Reflector)),
  );

  const config = new DocumentBuilder()
    .setTitle('User-Managment')
    .setDescription(
      'A backend microservice architecture serving user managment and data services.',
    )
    .setVersion('0.1')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(userManagementApp, config);

  if (process.env.NODE_ENV === 'Development') {
    //Only use swagger in development
    SwaggerModule.setup('api', userManagementApp, document);
  }

  const { httpAdapter } = userManagementApp.get(HttpAdapterHost);
  userManagementApp.useGlobalFilters(
    new PrismaClientExceptionFilter(httpAdapter),
  );

  // Need to enable cors so that front end server requests do not get blocked.
  userManagementApp.enableCors({ allowedHeaders: 'Authorization' });

  // Run migrations and seed file only if your staging a production environment.
  if (process.env.STAGING_PRODUCTION === 'true') {
    // Run Migrations
    await runMigrations();
    // Run seed file if Admin account doesn't exist.
    await runAdminSeed();
  }

  await userManagementApp.listen(3000);
}
bootstrap();
