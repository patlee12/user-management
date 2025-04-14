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
import type { RequestHandler } from 'express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(UserManagementModule);

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const port = process.env.PORT || 3001;

  const isProd = process.env.NODE_ENV?.toLowerCase() === 'production';
  const domainHost = process.env.DOMAIN_HOST?.trim();
  const frontendUrl = process.env.FRONTEND_URL?.replace(/^https?:\/\//, '');
  const hostValue =
    isProd && domainHost
      ? domainHost
      : frontendUrl
        ? frontendUrl
        : 'localhost:3000';
  const corsOrigin = isProd ? `https://${hostValue}` : `http://${hostValue}`;
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

  if (isProd) {
    const adminAuthMiddleware = new AdminAuthMiddleware(prisma);
    app.use(adminRootPath, adminAuthMiddleware.use.bind(adminAuthMiddleware));
    logger.log(`🔐 Admin middleware applied at ${adminRootPath}`);
  }

  app.use(adminRootPath, adminRouter as unknown as RequestHandler);
  logger.log(`🛡️  Admin panel mounted at ${adminRootPath}`);

  // Swagger setup
  if (process.env.ENABLE_SWAGGER === 'true') {
    const swaggerPath = '/api';
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

  if (!isProd) {
    const backendUrl = `http://${localIpAddress}:${port}`;
    updateFrontendEnv('NEXT_PUBLIC_BACKEND_URL', backendUrl);
  }

  await app.listen(port);
  logger.log(`🚀 Server listening on: http://localhost:${port}`);

  if (isProd) {
    logger.log(`🌍 Production Domain: https://${domainHost}`);
    logger.log(`📖  Swagger Docs:     https://${domainHost}/api`);
  } else {
    await waitForPortOpen(+port);
    logger.log(`🧪 Dev IP:           http://${localIpAddress}:${port}`);
    logger.log(`📖 Swagger Docs:     http://${localIpAddress}:${port}/api`);
    if (dockerIp) {
      logger.log(`🐳 Docker IP:        http://${dockerIp}:${port}`);
    }
  }

  logger.log('✅ App bootstrap complete.');
}

bootstrap();
