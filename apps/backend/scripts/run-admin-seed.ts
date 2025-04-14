import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const prisma = new PrismaClient();
const execPromise = promisify(exec);

(async () => {
  const email = process.env.ADMIN_EMAIL;
  if (!email) {
    console.error('❌ ADMIN_EMAIL is not set');
    process.exit(1);
  }

  const admin = await prisma.user.findFirst({ where: { email } });

  if (admin) {
    console.log('ℹ️  Admin already exists → skipping full seed.');
  } else {
    console.log('⚙️  No admin found → running prisma db seed …');
    await execPromise('yarn prisma db seed');
    console.log('✅  Seed finished.');
  }

  await prisma.$disconnect();
})();
