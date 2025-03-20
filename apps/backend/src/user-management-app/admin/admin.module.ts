import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // Ensure correct import path

@Module({
  imports: [
    // Dynamically import AdminModule and Prisma-related modules
    import('@adminjs/nestjs').then(({ AdminModule }) =>
      import('adminjs').then((AdminJSModule) => {
        const AdminJS = AdminJSModule.default; // Access the default export of AdminJS

        // Dynamically import @adminjs/prisma modules
        return import('@adminjs/prisma').then((prismaModule) => {
          const { Database, Resource, getModelByName } = prismaModule; // Access necessary exports

          // Register the AdminJS adapter for Prisma
          AdminJS.registerAdapter({ Database, Resource });

          return AdminModule.createAdminAsync({
            useFactory: (prisma: PrismaService) => {
              const cookieSecret = process.env.COOKIE_SECRET;

              return {
                adminJsOptions: {
                  rootPath: '/admin',
                  resources: [
                    {
                      resource: {
                        model: getModelByName('AccountRequest'),
                        client: prisma,
                      },
                      options: {},
                    },
                    {
                      resource: {
                        model: getModelByName('User'),
                        client: prisma,
                      },
                      options: {},
                    },
                    {
                      resource: {
                        model: getModelByName('PasswordReset'),
                        client: prisma,
                      },
                      options: {},
                    },
                    {
                      resource: {
                        model: getModelByName('Role'),
                        client: prisma,
                      },
                      options: {},
                    },
                    {
                      resource: {
                        model: getModelByName('Resource'),
                        client: prisma,
                      },
                      options: {},
                    },
                    {
                      resource: {
                        model: getModelByName('Permission'),
                        client: prisma,
                      },
                      options: {},
                    },
                    {
                      resource: {
                        model: getModelByName('UserRoles'),
                        client: prisma,
                      },
                      options: {},
                    },
                    {
                      resource: {
                        model: getModelByName('Post'),
                        client: prisma,
                      },
                      options: {},
                    },
                    {
                      resource: {
                        model: getModelByName('mfa_auth'),
                        client: prisma,
                      },
                      options: {},
                    },
                  ],
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
            inject: [PrismaService], // Inject PrismaService to access the prisma client
          });
        });
      }),
    ),
  ],
  controllers: [],
  providers: [PrismaService], // Ensure PrismaService is provided here
})
export class AdminModule {}
