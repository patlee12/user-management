import { PrismaClient } from '@prisma/client';

/**
 * Generates a unique, sanitized username.
 *
 * - If email is provided, uses the local part (before @) as the base.
 * - If email is missing (e.g. One from Apple Sign-In with hidden email),
 *   falls back to using a generic "guestuser" prefix.
 * - Appends a random 4-digit suffix if the username is already taken.
 *
 * @param email - User's email address, or undefined/null.
 * @param prisma - PrismaClient instance (from NestJS PrismaService).
 * @returns A unique and safe username string.
 */
export async function generateUniqueUsername(
  email: string | undefined | null,
  prisma: PrismaClient,
): Promise<string> {
  const base = email
    ? email
        .split('@')[0]
        .replace(/[^a-zA-Z0-9]/g, '')
        .toLowerCase()
    : 'guestuser';

  let username = base;

  while (await prisma.user.findUnique({ where: { username } })) {
    username = `${base}${Math.floor(1000 + Math.random() * 9000)}`;
  }

  return username;
}
