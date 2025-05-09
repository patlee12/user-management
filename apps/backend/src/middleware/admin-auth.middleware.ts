import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from '@src/user-management-app/auth/interfaces/jwt-payload.interface';
import {
  DOMAIN_HOST,
  EMAIL_USER,
  JWT_SECRET,
} from '@src/common/constants/environment';

@Injectable()
export class AdminAuthMiddleware implements NestMiddleware {
  private logger = new Logger('AdminAuthMiddleware');

  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    this.logger.log('🔐 Checking AdminJS token access...');

    try {
      const token =
        req.cookies?.access_token ||
        req.headers['authorization']?.replace('Bearer ', '');

      if (!token) {
        throw new UnauthorizedException('Missing access token');
      }

      const decoded = jwt.verify(token, JWT_SECRET!) as JwtPayload;

      const userRoles = await this.prisma.userRoles.findMany({
        where: { userId: decoded.userId },
        include: { role: true },
      });

      const isAdmin = userRoles.some(
        (ur) => ur.role.name.toLowerCase() === 'admin',
      );
      if (!isAdmin) {
        throw new UnauthorizedException('Admin role required');
      }

      (req as any).user = decoded;
      next();
    } catch (err) {
      this.logger.warn(`Access denied: ${err.message}`);
      res.status(401).send(this.getHtml401Page(req));
    }
  }

  private getHtml401Page(req: Request): string {
    const protocol = req.protocol || 'https';
    const baseDomain = req.hostname.replace(/^admin\./, '');
    const homeUrl = `${protocol}://${baseDomain}`;
    const siteName = DOMAIN_HOST?.trim() || 'User Management';
    const supportEmail = EMAIL_USER?.trim() || 'support@user-management.net';

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>401 – Unauthorized</title>
        <style>
          :root {
            --bg-color: #0d0d0d;
            --text-color: #f4f4f4;
            --card-bg: #1a1a1a;
            --border-radius: 1rem;
            --btn-bg: #2c2c2c;
            --btn-text: #e0e0e0;
            --btn-hover-bg: #3a3a3a;
          }
  
          body {
            margin: 0;
            background: var(--bg-color);
            color: var(--text-color);
            font-family: 'Inter', system-ui, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            padding: 1rem;
          }
  
          .card {
            background: var(--card-bg);
            border-radius: var(--border-radius);
            padding: 2rem 3rem;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.6);
            text-align: center;
            max-width: 420px;
            width: 100%;
            animation: fadeIn 1.2s ease-out;
          }
  
          .site-name {
            font-size: 1rem;
            color: #999;
            margin-bottom: 1.25rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
  
          h1 {
            font-size: 3rem;
            margin-bottom: 0.5rem;
          }
  
          p {
            font-size: 1.125rem;
            margin-bottom: 1.5rem;
            color: #ccc;
          }
  
          .actions {
            display: flex;
            gap: 0.75rem;
            justify-content: center;
            flex-wrap: wrap;
          }
  
          a {
            display: inline-block;
            padding: 0.65rem 1.25rem;
            border-radius: 999px;
            background-color: var(--btn-bg);
            color: var(--btn-text);
            font-weight: 500;
            text-decoration: none;
            transition: background 0.3s ease;
            font-size: 0.95rem;
          }
  
          a:hover {
            background-color: var(--btn-hover-bg);
          }
  
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="site-name">${siteName}</div>
          <h1>401</h1>
          <p>Unauthorized access – Admins only</p>
          <div class="actions">
            <a href="${homeUrl}">Return to Homepage</a>
            <a href="mailto:${supportEmail}">✉️ Contact Support</a>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
