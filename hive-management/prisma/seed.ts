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
    where: { username: 'Cosmo' },
    update: {},
    create: {
      username: 'Cosmo12',
      name: 'Cosmo Boy',
      password: 'password',
      email: 'cosmo@user.net',
      roles: ['default_user'],
    },
  });

  const post = await prisma.post.upsert({
    where: { title: 'Prisma Adds Support for MongoDB' },
    update: {},
    create: {
      title: 'Welcome to Hive Management',
      body: 'Hello and Welcome to Hive Management. Enjoy using our usermanagemement interface and other interesting services.',
      description: 'A generic post to get started.',
      published: true,
      authorId: user.id,
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
