import { PrismaClient } from '@prisma/client';

// initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { username: 'Pat' },
    update: {},
    create: {
      username: 'Pat',
      password: 'password',
      email: 'patrick@admin.net',
      roles: ['admin', 'default_user'],
    },
  });

  const user2 = await prisma.user.upsert({
    where: { username: 'Eddy' },
    update: {},
    create: {
      username: 'Eddy12',
      name: 'Eddy Admin',
      password: 'password',
      email: 'eddy@admin.net',
      roles: ['admin', 'default_user'],
    },
  });

  const post = await prisma.post.upsert({
    where: { title: 'Prisma Adds Support for MongoDB' },
    update: {
      authorId: user2.id,
    },
    create: {
      title: 'Welcome to Hive Management',
      body: 'Hello and Welcome to Hive Management. Enjoy using our usermanagemement interface and other interesting services.',
      description: 'A generic post to get started.',
      published: true,
      authorId: user2.id,
    },
  });

  console.log({ user }, { user2 }, { post });
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
