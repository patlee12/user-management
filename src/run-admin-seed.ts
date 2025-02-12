import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

/**
 * This will run only if admin account doesn't already exist.
 * Please make sure to set your .env with passwords etc.
 */
export async function runAdminSeed() {
  const prisma = new PrismaClient();
  // const roundsOfHashing = 10;

  console.log('Checking if admin user exists...');
  const adminExists = await prisma.user.findFirst({
    where: { email: process.env.ADMIN_EMAIL },
  });

  if (!adminExists) {
    console.log("Admin account doesn't exist. Running Admin seed.");

    try {
      console.log('Hashing Admin password...');
      const passwordAdmin = await argon2.hash(process.env.ADMIN_PASSWORD);

      console.log('Upserting admin user...');
      const user = await prisma.user.upsert({
        where: { username: 'Admin' },
        update: { password: passwordAdmin },
        create: {
          username: 'Admin',
          name: 'Admin',
          password: passwordAdmin,
          email: process.env.ADMIN_EMAIL,
        },
      });

      console.log('Upserting resource...');
      const createResource = await prisma.resource.upsert({
        where: { name: 'AllResources' },
        update: {},
        create: {
          name: 'AllResources',
          description:
            'A master resource for admins to assign admin permissions.',
          createdBy: user.id,
          updatedBy: user.id,
        },
      });

      console.log('Upserting role...');
      const createRole = await prisma.role.upsert({
        where: { name: 'Admin' },
        update: {},
        create: {
          name: 'Admin',
          description: 'Admin across the entire application.',
          permissions: {
            create: [
              {
                actionType: 'MANAGE',
                description: 'Manage users.',
                resourceId: createResource.id,
                isActive: true,
                createdBy: user.id,
                updatedBy: user.id,
              },
              {
                actionType: 'READ',
                description: 'Read Dashboard',
                resourceId: createResource.id,
                isActive: true,
                createdBy: user.id,
                updatedBy: user.id,
              },
            ],
          },
          createdBy: user.id,
          updatedBy: user.id,
        },
      });

      console.log('Upserting user roles...');
      await prisma.userRoles.upsert({
        where: { userId_roleId: { userId: user.id, roleId: createRole.id } },
        update: {},
        create: { userId: user.id, roleId: createRole.id, assignedBy: user.id },
      });

      console.log('Upserting post...');
      await prisma.post.upsert({
        where: { title: 'Welcome to Hive Management' },
        update: {},
        create: {
          title: 'Welcome to Hive Management',
          body: 'Hello and Welcome to Hive Management. Enjoy using our usermanagemement interface and other interesting services.',
          description: 'A generic post to get started.',
          published: true,
          authorId: user.id,
        },
      });

      console.log('Seed complete!');
      console.log(user);
    } catch (error) {
      console.error('Error in seed process:', error);
    }
  } else {
    console.log('Skipping Admin Seed. Admin already exists.');
  }

  // Ensure to disconnect Prisma Client at the end
  await prisma.$disconnect();
}
