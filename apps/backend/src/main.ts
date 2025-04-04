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
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const userManagementApp = await NestFactory.create(UserManagementModule);
  userManagementApp.use(cookieParser());

  // Global validation pipes and serialization interceptors
  userManagementApp.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  userManagementApp.useGlobalInterceptors(
    new ClassSerializerInterceptor(userManagementApp.get(Reflector)),
  );

  const port = process.env.PORT;

  // Normalize global prefix by stripping leading/trailing slashes
  const rawPrefix = process.env.GLOBAL_PREFIX || '';
  const globalPrefix = rawPrefix.replace(/^\/+/, '').replace(/\/+$/, '');
  const prefix = globalPrefix ? `/${globalPrefix}` : '';

  if (globalPrefix) {
    userManagementApp.setGlobalPrefix(globalPrefix);
    logger.log(`Global prefix set to ${prefix}`);
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

  // Get the local IP address of the server (LAN IP, including Docker interfaces)
  const networkInterfaces = os.networkInterfaces();
  let localIpAddress = 'localhost'; // Default to localhost
  let dockerIpAddress = ''; // Store Docker IP

  for (const interfaceName in networkInterfaces) {
    for (const interfaceInfo of networkInterfaces[interfaceName]) {
      if (interfaceInfo.family === 'IPv4' && !interfaceInfo.internal) {
        if (interfaceName.startsWith('docker')) {
          dockerIpAddress = interfaceInfo.address;
        } else {
          localIpAddress = interfaceInfo.address;
        }
      }
    }
  }

  // Determine environment
  const isProduction = process.env.NODE_ENV?.toLowerCase() === 'production';

  // Strip any protocol from the FRONTEND_URL just in case
  const frontendUrl = process.env.FRONTEND_URL?.replace(/^https?:\/\//, '');

  // Determine host
  const host =
    isProduction && frontendUrl ? frontendUrl : `${localIpAddress}:3000`;

  // Ensure FRONTEND_URL is updated in dev
  if (!isProduction) {
    process.env.FRONTEND_URL = `http://${localIpAddress}:3000`;
  }

  // Final origin string
  const corsOrigin = isProduction ? `https://${host}` : `http://${host}`;

  // Debugging tip (optional)
  console.log('🔐 CORS Origin:', corsOrigin);

  // CORS setup
  userManagementApp.enableCors({
    origin: corsOrigin,
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  // Start app
  await userManagementApp.listen(port || 3001);

  if (isProduction) {
    logger.log(`🚀 [Production] Homepage Application:     http://${host}`);
    logger.log(
      `🚀 [Production] API Server:               http://${host}${prefix}`,
    );
    logger.log(
      `🚀 [Production] Swagger Docs:             http://${host}${prefix}/api`,
    );
    logger.log(
      `🚀 [Production] AdminJS Panel:            http://${host}${prefix}/admin`,
    );
  } else {
    logger.log(
      `🚀 [Development] Homepage Application:    http://${localIpAddress}:3000`,
    );
    logger.log(
      `🚀 [Development] API Server:              http://${localIpAddress}:${port}${prefix}`,
    );
    logger.log(
      `🚀 [Development] Swagger Docs:            http://${localIpAddress}:${port}${prefix}/api`,
    );
    logger.log(
      `🚀 [Development] AdminJS Panel:           http://${localIpAddress}:${port}${prefix}/admin`,
    );
    if (dockerIpAddress) {
      logger.log('');
      logger.log(
        `🚀 Docker: Homepage Application:          http://${dockerIpAddress}:3000`,
      );
      logger.log(
        `🚀 Docker: API Server:                    http://${dockerIpAddress}:${port}${prefix}`,
      );
      logger.log(
        `🚀 Docker: Swagger Docs:                  http://${dockerIpAddress}:${port}${prefix}/api`,
      );
      logger.log(
        `🚀 Docker: AdminJS Panel:                 http://${dockerIpAddress}:${port}${prefix}/admin`,
      );
    }
  }

  logger.log('========================================');
  logger.log('');
}

bootstrap();
