import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { UserManagementModule } from './user-management-app/user-management.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {
  ValidationPipe,
  ClassSerializerInterceptor,
  Logger,
} from '@nestjs/common';
import { PrismaClientExceptionFilter } from './prisma-client-exception/prisma-client-exception.filter';
import { runAdminSeed } from './run-admin-seed';
import { runMigrations } from './run-migrations';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const userManagementApp = await NestFactory.create(UserManagementModule);

  // Global validation pipes and serialization interceptors
  userManagementApp.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  userManagementApp.useGlobalInterceptors(
    new ClassSerializerInterceptor(userManagementApp.get(Reflector)),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('User-Management')
    .setDescription(
      'A backend microservice architecture serving user management and authentication services.',
    )
    .setVersion('0.1')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(userManagementApp, config);

  // Setup Swagger UI only if ENABLE_SWAGGER is true (recommended for development)
  if (process.env.ENABLE_SWAGGER === 'true') {
    SwaggerModule.setup('api', userManagementApp, document);
    logger.log('Swagger available at /api');
  }

  // Handle Prisma client exceptions globally
  const { httpAdapter } = userManagementApp.get(HttpAdapterHost);
  userManagementApp.useGlobalFilters(
    new PrismaClientExceptionFilter(httpAdapter),
  );

  // Enable CORS so frontend requests aren't blocked
  userManagementApp.enableCors({ allowedHeaders: 'Authorization' });

  // Run migrations and seed only in production mode
  if (
    process.env.STAGING_PRODUCTION === 'true' &&
    process.env.NODE_ENV === 'Production'
  ) {
    logger.log('Running migrations and seed...');
    await runMigrations();
    await runAdminSeed();
  }

  // Start the app and log the server information
  await userManagementApp.listen(3000);
  logger.log(`🚀 Server running at http://localhost:3000`);
  logger.log(`🚀 AdminJS running at http://localhost:3000/admin`);
}

bootstrap();
