import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

/**
 * Run Prisma migrations
 */
export async function runMigrations() {
  try {
    console.log('Generating Prisma Client...');
    await execPromise('yarn prisma generate');
    console.log('Prisma Client generated successfully.');

    console.log('Running Prisma migrations...');
    await execPromise('yarn prisma migrate deploy');
    console.log('Migrations applied successfully.');
  } catch (error) {
    console.error('Error during migration process:', error);
  }
}
