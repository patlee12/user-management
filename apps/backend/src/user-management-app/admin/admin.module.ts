import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { join } from 'path';

@Module({
  imports: [
    import('@adminjs/nestjs').then(({ AdminModule }) =>
      import('adminjs').then((AdminJSModule) => {
        const AdminJS = AdminJSModule.default;
        const { ComponentLoader } = AdminJSModule;

        return import('@adminjs/prisma').then((prismaModule) => {
          const { Database, Resource, getModelByName } = prismaModule;

          AdminJS.registerAdapter({ Database, Resource });

          const componentLoader = new ComponentLoader();
          const customDashboard = componentLoader.add(
            'CustomDashboard',
            join(__dirname, 'components', 'Dashboard'),
          );

          return AdminModule.createAdminAsync({
            useFactory: (prisma: PrismaService) => {
              const cookieSecret = process.env.COOKIE_SECRET;

              return {
                adminJsOptions: {
                  rootPath: '/admin',
                  componentLoader,
                  dashboard: {
                    component: customDashboard,
                  },
                  branding: {
                    companyName: 'User Management',
                    softwareBrothers: false,
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
                },
                auth: {
                  authenticate: async (email: string, password: string) => {
                    if (
                      email === process.env.ADMIN_EMAIL &&
                      password === process.env.ADMIN_PASSWORD
                    ) {
                      return { email };
                    }
                    return null;
                  },
                  cookieName: 'adminjs',
                  cookiePassword: cookieSecret,
                },
                sessionOptions: {
                  resave: true,
                  saveUninitialized: true,
                  secret: cookieSecret,
                },
              };
            },
            inject: [PrismaService],
          });
        });
      }),
    ),
  ],
  providers: [PrismaService],
})
export class AdminModule {}
