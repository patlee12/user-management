import crypto from 'crypto';
import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';
import { JWT_SECRET } from '@src/common/constants/environment';

const IV_LENGTH = 16; // AES requires 16-byte IV

/**
 * Encrypt secret using crypto library and Server key.
 * @param secret
 * @param serverKey
 * @returns {Promise<string>}
 */
export async function encryptSecret(
  secret: string,
  serverKey: string,
): Promise<string> {
  const iv = await crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(serverKey, 'hex'),
    iv,
  );
  let encrypted = cipher.update(secret, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt Secret using server key.
 * @param encryptedSecret
 * @param serverKey
 * @returns {string}
 */
export function decryptSecret(
  encryptedSecret: string,
  serverKey: string,
): string {
  const [ivHex, encryptedText] = encryptedSecret.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(serverKey, 'hex'),
    iv,
  );
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Uses Crypto library to generate a random 64-character hex token.
 * @returns {Promise<string>}
 */
export async function generateToken(): Promise<string> {
  return await crypto.randomBytes(32).toString('hex');
}

/**
 * Generates a secure, random dummy password hash for OAuth-only users.
 * This hash should never be used for actual login but satisfies schema and validation rules.
 *
 * @returns {Promise<string>} An Argon2-hashed random value.
 */
export async function generateDummyPassword(): Promise<string> {
  const randomSecret = `${randomUUID()}-${JWT_SECRET}`;
  return await argon2.hash(randomSecret);
}
