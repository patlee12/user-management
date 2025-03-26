import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { UserManagementModule } from './user-management-app/user-management.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {
  ValidationPipe,
  ClassSerializerInterceptor,
  Logger,
} from '@nestjs/common';
import { PrismaClientExceptionFilter } from './prisma-client-exception/prisma-client-exception.filter';
import * as os from 'os';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const userManagementApp = await NestFactory.create(UserManagementModule);

  // Global validation pipes and serialization interceptors
  userManagementApp.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  userManagementApp.useGlobalInterceptors(
    new ClassSerializerInterceptor(userManagementApp.get(Reflector)),
  );

  const globalPrefix = process.env.GLOBAL_PREFIX;

  if (globalPrefix) {
    userManagementApp.setGlobalPrefix(globalPrefix);
    logger.log(`Global prefix set to /${globalPrefix}`);
  } else {
    logger.warn('No global prefix set. Routes will be registered at root.');
  }

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
    const swaggerPath = globalPrefix ? `${globalPrefix}/api` : 'api';
    SwaggerModule.setup(swaggerPath, userManagementApp, document);
    logger.log(`Swagger available at /${swaggerPath}`);
  }

  // Handle Prisma client exceptions globally
  const { httpAdapter } = userManagementApp.get(HttpAdapterHost);
  userManagementApp.useGlobalFilters(
    new PrismaClientExceptionFilter(httpAdapter),
  );

  // Enable CORS so frontend requests aren't blocked
  userManagementApp.enableCors({ allowedHeaders: 'Authorization' });

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
