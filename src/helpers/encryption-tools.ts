import crypto from 'crypto';

const IV_LENGTH = 16; // AES requires 16-byte IV

/**
 * Encrypt secret using crypto library and Server key.
 * @param secret
 * @param serverKey
 * @returns {string}
 */
export function encryptSecret(secret: string, serverKey: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
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
