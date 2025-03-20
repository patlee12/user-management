import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

/**
 * This will run only if admin account doesn't already exist.
 * Please make sure to set your .env with passwords etc.
 */
export async function runAdminSeed() {
  const prisma = new PrismaClient();

  console.log('Checking if admin user exists...');
  const adminExists = await prisma.user.findFirst({
    where: { email: process.env.ADMIN_EMAIL },
  });

  if (!adminExists) {
    console.log("Admin account doesn't exist. Running Admin seed.");

    try {
      await execPromise('yarn prisma generate');
      console.log('Prisma Client generated successfully.');

      console.log('Running Prisma Seed...');
      await execPromise('yarn prisma db seed');
      console.log('Admin Seed Completed Successfully.');
    } catch (error) {
      console.error('Error during seed process:', error);
    }
  } else {
    console.log('Skipping Admin Seed. Admin already exists.');
  }

  // Ensure to disconnect Prisma Client at the end
  await prisma.$disconnect();
}
