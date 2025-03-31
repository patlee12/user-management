import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

const prisma = new PrismaClient();

async function runAdminSeed() {
  console.log('✅ Admin Seed Script Started');

  const email = process.env.ADMIN_EMAIL;
  if (!email) {
    console.error('❌ ADMIN_EMAIL is not defined in the environment');
    process.exit(1);
  }

  console.log('🔍 Looking for existing admin with email:', email);

  const adminExists = await prisma.user.findFirst({ where: { email } });

  if (adminExists) {
    console.log('ℹ️ Admin user already exists. Skipping seed.');
  } else {
    console.log('⚙️ Admin user not found. Running seed...');

    try {
      await execPromise('yarn prisma generate');
      console.log('✅ Prisma client generated');

      await execPromise('yarn prisma db seed');
      console.log('✅ Admin seed ran successfully');
    } catch (err) {
      console.error('❌ Error running seed:', err);
    }
  }

  await prisma.$disconnect();
  console.log('👋 Seed script finished');
}

runAdminSeed();
