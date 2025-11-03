import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const prisma = new PrismaClient();
const execPromise = promisify(exec);

(async () => {
  const email = process.env.ADMIN_EMAIL;
  const isProd = process.env.NODE_ENV?.toLowerCase() === 'production';

  if (!email) {
    console.error('❌ ADMIN_EMAIL is not set');
    process.exit(1);
  }

  const admin = await prisma.user.findFirst({ where: { email } });

  if (admin && isProd) {
    console.log('ℹ️  Admin already exists → skipping full seed.');
    await prisma.$disconnect();
    process.exit(0);
  }

  console.log(
    `⚙️  Running seed in ${isProd ? 'production' : 'development'}...`,
  );

  try {
    if (isProd) {
      await execPromise('yarn prisma db seed');
    } else {
      await execPromise('ts-node -P ./tsconfig.json ./prisma/seed.ts');
    }

    console.log('✅ Seed finished.');
  } catch (e) {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
