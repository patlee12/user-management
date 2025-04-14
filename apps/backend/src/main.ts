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
import { updateFrontendEnv } from 'scripts/update-frontend-env';
import { waitForPortOpen } from './helpers/network';
import { PrismaService } from './prisma/prisma.service';
import { SwaggerAuthMiddleware } from './middleware/swagger-auth.middleware';
import { AdminAuthMiddleware } from './middleware/admin-auth.middleware';
import { setupAdminPanel } from './user-management-app/admin/setup-admin-panel';
import { getHttpsOptions } from './helpers/https-options';
import type { RequestHandler } from 'express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(UserManagementModule, getHttpsOptions());

  const port = process.env.PORT || 3001;

  const nodeEnv = process.env.NODE_ENV?.toLowerCase();
  const isProd = nodeEnv === 'production';
  const domainHost = process.env.DOMAIN_HOST?.trim();
  const frontendUrl = process.env.FRONTEND_URL?.replace(/^https?:\/\//, '');
  const globalPrefix = process.env.GLOBAL_PREFIX?.trim();
  const isLanDeployment = isProd && !domainHost && !!globalPrefix;

  // Apply global prefix (LAN deployment only)
  if (isLanDeployment && globalPrefix) {
    app.setGlobalPrefix(globalPrefix);
    logger.log(`🔧 Global prefix set to: ${globalPrefix}`);
  }

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const hostValue =
    isProd && domainHost
      ? domainHost
      : frontendUrl
        ? frontendUrl
        : 'localhost:3000';

  const corsOrigin = `https://${hostValue}`;
  logger.log(`🔐 CORS Origin: ${corsOrigin}`);

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
  });

  const prisma = app.get(PrismaService);

  // Mount AdminJS
  const { adminRootPath, adminRouter } = await setupAdminPanel(prisma);
  const adminPath = isLanDeployment
    ? `${globalPrefix}${adminRootPath}`
    : adminRootPath;

  if (isProd) {
    const adminAuthMiddleware = new AdminAuthMiddleware(prisma);
    app.use(adminPath, adminAuthMiddleware.use.bind(adminAuthMiddleware));
    logger.log(`🔐 Admin middleware applied at ${adminPath}`);
  }

  app.use(adminPath, adminRouter as unknown as RequestHandler);
  logger.log(`🛡️  Admin panel mounted at ${adminPath}`);

  // Swagger setup
  const swaggerPath = isLanDeployment ? `${globalPrefix}/api` : '/api';
  if (process.env.ENABLE_SWAGGER === 'true') {
    if (isProd) {
      const swaggerAuthMiddleware = new SwaggerAuthMiddleware(prisma);
      app.use(
        swaggerPath,
        swaggerAuthMiddleware.use.bind(swaggerAuthMiddleware),
      );
      logger.log(`🔐 Swagger middleware bound on: ${swaggerPath}`);
    }

    const swaggerConfig = new DocumentBuilder()
      .setTitle('User-Management')
      .setDescription('User management & authentication microservice')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(swaggerPath, app, document);
  }

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  // Network info logging
  const networkInterfaces = os.networkInterfaces();
  let localIpAddress = 'localhost';
  let dockerIp = '';
  for (const iface of Object.values(networkInterfaces)) {
    for (const addr of iface || []) {
      if (addr.family === 'IPv4' && !addr.internal) {
        if (
          addr.address.startsWith('172.') ||
          addr.address.startsWith('10.') ||
          addr.address.startsWith('192.168.')
        ) {
          localIpAddress = addr.address;
        }
        if (
          addr.address.startsWith('172.') &&
          iface.toString().includes('docker')
        ) {
          dockerIp = addr.address;
        }
      }
    }
  }

  await app.listen(port);
  logger.log(`🚀 Server listening on: https://localhost:${port}`);

  // Final Environment Logging
  if (isProd && domainHost) {
    logger.log(`🌍 Public Domain:     https://${domainHost}`);
    logger.log(`📖 Swagger Docs:     https://${domainHost}/api`);
  } else if (isLanDeployment) {
    logger.log(
      `🌐 LAN Deployment:   https://${localIpAddress}:${port}${globalPrefix}`,
    );
    logger.log(
      `📖 Swagger Docs:     https://${localIpAddress}:${port}${swaggerPath}`,
    );
  } else {
    await waitForPortOpen(+port);
    logger.log(`🧪 Dev IP:           https://${localIpAddress}:${port}`);
    logger.log(
      `📖 Swagger Docs:     https://${localIpAddress}:${port}${swaggerPath}`,
    );
    if (dockerIp) {
      logger.log(`🐳 Docker IP:        https://${dockerIp}:${port}`);
    }
  }

  logger.log('✅ App bootstrap complete.');
}

bootstrap();
