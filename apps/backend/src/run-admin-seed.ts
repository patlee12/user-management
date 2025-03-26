import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as dotenv from 'dotenv';

// Load the root .env file (from docker folder)
dotenv.config({ path: '../../docker/.env' });

// Load the backend .env file (from the current directory)
dotenv.config({ path: './.env' });

console.log('ADMIN EMAIL:', process.env.ADMIN_EMAIL);

const execPromise = promisify(exec);

/**
 * This will run only if admin account doesn't already exist.
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

  await prisma.$disconnect();
}

runAdminSeed();
