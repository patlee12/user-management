import { PrismaClient } from '@prisma/client';

// initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  // create two dummy articles
  const user = await prisma.user.upsert({
    where: { username: 'Pat' },
    update: {},
    create: {
      username: 'Pat',
      password: 'password',
      roles: ['admin', 'default_user'],
    },
  });

  console.log({ user });
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
