import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import * as dotenv from 'dotenv';

dotenv.config(); // Load variables from .env

const prisma = new PrismaClient();

async function main() {
  if (!process.env.ADMIN_PASSWORD) {
    throw new Error(
      '❌ ADMIN_PASSWORD is not defined in the environment variables.',
    );
  }

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

  const profile = await prisma.profile.create({
    data: {
      userId: user.id,
      name: user.name || user.email,
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

  const createAdminRole = await prisma.role.upsert({
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

  const createUserRole = await prisma.role.upsert({
    where: { name: 'User' },
    update: {},
    create: {
      name: 'User',
      description: 'Regular User across the entire application.',
      permissions: {},
      createdBy: user.id,
      updatedBy: user.id,
    },
  });

  const updateUserRoles = await prisma.userRoles.upsert({
    where: { userId_roleId: { userId: user.id, roleId: createAdminRole.id } },
    update: {},
    create: {
      userId: user.id,
      roleId: createAdminRole.id,
      assignedBy: user.id,
    },
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

  console.log('\n✅ Seed completed:', {
    user,
    profile,
    createResource,
    createAdminRole,
    createUserRole,
    updateUserRoles,
    post,
  });
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
