import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '@src/prisma/prisma.service';
import { JwtPayload } from '@src/user-management-app/auth/jwt.strategy';

@Injectable()
export class SwaggerAuthMiddleware implements NestMiddleware {
  private logger = new Logger('SwaggerAuthMiddleware');

  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    this.logger.log('Checking token access for Swagger...');

    try {
      const token =
        req.cookies?.access_token ||
        req.headers['authorization']?.replace('Bearer ', '');

      if (!token) {
        throw new UnauthorizedException('Missing token');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

      const userRoles = await this.prisma.userRoles.findMany({
        where: { userId: decoded.userId },
        include: { role: true },
      });

      const isAdmin = userRoles.some((ur) => ur.role.name === 'Admin');
      if (!isAdmin) {
        throw new UnauthorizedException('Admin access required for Swagger');
      }

      next();
    } catch (error) {
      this.logger.warn(`Access denied: ${error.message}`);
      res.status(401).send(this.getHtml401Page(req));
    }
  }

  private getHtml401Page(req: Request): string {
    const protocol = req.protocol || 'https';
    const baseDomain = req.hostname.replace(/^swagger\./, '');
    const homeUrl = `${protocol}://${baseDomain}`;

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>401 - Unauthorized</title>
        <style>
          body {
            background: #1e1e1e;
            color: #fff;
            font-family: system-ui, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
          }
          h1 {
            font-size: 4rem;
            margin-bottom: 0.5rem;
          }
          p {
            font-size: 1.2rem;
            margin-bottom: 2rem;
          }
          a {
            color: #f7931a;
            text-decoration: none;
            font-weight: bold;
            border: 2px solid #f7931a;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            transition: background 0.2s ease;
          }
          a:hover {
            background: #f7931a;
            color: #000;
          }
        </style>
      </head>
      <body>
        <h1>401</h1>
        <p>Unauthorized – Swagger docs are admin-only.</p>
        <a href="${homeUrl}">Return Home</a>
      </body>
      </html>
    `;
  }
}
