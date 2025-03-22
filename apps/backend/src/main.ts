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
import * as os from 'os';
import * as dotenv from 'dotenv';

// Perform substitutions for the database url in Development only.
if (process.env.NODE_ENV === 'Development') {
  // Load the root .env file
  dotenv.config({ path: '../../docker/.env' });

  // Load the backend .env file
  dotenv.config({ path: './.env' });

  const databaseUrl = process.env.DATABASE_URL?.replace(
    '${POSTGRES_USER}',
    process.env.POSTGRES_USER || 'default_user',
  )
    .replace(
      '${POSTGRES_PASSWORD}',
      process.env.POSTGRES_PASSWORD || 'default_password',
    )
    .replace('${POSTGRES_DB}', process.env.POSTGRES_DB || 'default_db')
    .replace('@postgres:', '@localhost:');

  process.env.DATABASE_URL = databaseUrl || process.env.DATABASE_URL;
}

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

  // Get the local IP address of the server (LAN IP, including Docker interfaces)
  const networkInterfaces = os.networkInterfaces();
  let localIpAddress = 'localhost'; // Default to localhost
  let dockerIpAddress = ''; // Store Docker IP

  for (const interfaceName in networkInterfaces) {
    for (const interfaceInfo of networkInterfaces[interfaceName]) {
      // Check for non-internal IPv4 addresses
      if (interfaceInfo.family === 'IPv4' && !interfaceInfo.internal) {
        if (interfaceName.startsWith('docker')) {
          // Store Docker IP
          dockerIpAddress = interfaceInfo.address;
        } else {
          // Use the first LAN address found
          localIpAddress = interfaceInfo.address;
        }
      }
    }
  }

  // Start the app and log the server information
  await userManagementApp.listen(3000);

  // Log both LAN and Docker IP addresses, if available
  logger.log(`🚀 Server running at http://${localIpAddress}:3000 (LAN IP)`);
  logger.log(`🚀 AdminJS running at http://${localIpAddress}:3000/admin`);

  if (dockerIpAddress) {
    logger.log(`🚀 Docker running at http://${dockerIpAddress}:3000`);
    logger.log(
      `🚀 AdminJS Docker running at http://${dockerIpAddress}:3000/admin`,
    );
  }
}

bootstrap();
