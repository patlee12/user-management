import { join } from 'path';
import { PrismaService } from '../../prisma/prisma.service';
import { isProd } from '@src/common/constants/environment';

export async function setupAdminPanel(prisma: PrismaService) {
  const { default: AdminJS, ComponentLoader } = await import('adminjs');
  const AdminJSExpress = await import('@adminjs/express');
  const AdminJSPrisma = await import('@adminjs/prisma');
  const { Database, Resource, getModelByName } = AdminJSPrisma;

  AdminJS.registerAdapter({ Database, Resource });
  const rootPath = '/admin';
  const componentLoader = new ComponentLoader();
  const dashboardPath = isProd
    ? join(
        process.cwd(),
        'dist/src/user-management-app/admin/components/Dashboard',
      )
    : join(__dirname, 'components/Dashboard');
  const customDashboard = componentLoader.add('CustomDashboard', dashboardPath);
  const adminJs = new AdminJS({
    rootPath,
    componentLoader,
    dashboard: { component: customDashboard },
    branding: {
      companyName: 'User Management',
      logo: false,
      theme: {
        colors: {
          primary100: '#f7931a',
          primary80: '#fbbf24',
          primary60: '#facc15',
          primary40: '#fde68a',
          primary20: '#fef9c3',
        },
      },
    },
    resources: [
      'AccountRequest',
      'User',
      'PasswordReset',
      'Role',
      'Resource',
      'Permission',
      'UserRoles',
      'Post',
      'mfa_auth',
    ].map((modelName) => ({
      resource: {
        model: getModelByName(modelName),
        client: prisma,
      },
      options: {},
    })),
  });

  const adminRouter = AdminJSExpress.buildRouter(adminJs);

  return {
    adminRootPath: rootPath,
    adminRouter,
  };
}
