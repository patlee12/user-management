import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

// initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  const passwordAdmin = await argon2.hash(process.env.ADMIN_PASSWORD);

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

  const createResource = await prisma.resource.upsert({
    where: { name: 'AllResources' },
    update: {},
    create: {
      name: 'AllResources',
      description: 'A master resource for admins to assign admin permissions.',
      createdBy: user.id,
      updatedBy: user.id,
    },
  });

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

  const updateUserRoles = await prisma.userRoles.upsert({
    where: { userId_roleId: { userId: user.id, roleId: createRole.id } },
    update: {},
    create: { userId: user.id, roleId: createRole.id, assignedBy: user.id },
  });

  const post = await prisma.post.upsert({
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

  console.log(
    { user },
    { createResource },
    { createRole },
    { updateUserRoles },
    { post },
  );
}

// execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });
