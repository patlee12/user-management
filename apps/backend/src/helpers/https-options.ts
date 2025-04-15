import * as fs from 'fs';
import * as path from 'path';
import type { NestApplicationOptions } from '@nestjs/common/interfaces/nest-application-options.interface';
import selfsigned from 'selfsigned';

const CERT_DIR = path.resolve(__dirname, '../../certs');
const CERT_PATH = path.join(CERT_DIR, 'localhost.pem');
const KEY_PATH = path.join(CERT_DIR, 'localhost-key.pem');

/**
 * Generates a self-signed certificate using the `selfsigned` package.
 * This avoids any need for external tools like mkcert.
 */
function generateSelfSignedCerts() {
  console.warn(
    '[HTTPS] 🔐 Generating self-signed HTTPS certs for localhost (via selfsigned)...',
  );

  const attrs = [{ name: 'commonName', value: 'localhost' }];
  const pems = selfsigned.generate(attrs, {
    days: 365,
    keySize: 2048,
    algorithm: 'sha256',
  });

  if (!fs.existsSync(CERT_DIR)) {
    fs.mkdirSync(CERT_DIR, { recursive: true });
    console.log(`[HTTPS] 📁 Created certs directory: ${CERT_DIR}`);
  }

  fs.writeFileSync(CERT_PATH, pems.cert);
  fs.writeFileSync(KEY_PATH, pems.private);
  console.log('[HTTPS] ✅ Certificates written to certs/ folder.');
}

/**
 * Returns HTTPS options for NestFactory when running in development mode.
 * Automatically generates self-signed certs using Node-only tools if missing.
 * Returns `undefined` in production mode.
 */
export function getHttpsOptions(): NestApplicationOptions | undefined {
  const isProd = process.env.NODE_ENV?.toLowerCase() === 'production';
  if (isProd) return undefined;

  const certExists = fs.existsSync(CERT_PATH) && fs.existsSync(KEY_PATH);
  if (!certExists) {
    generateSelfSignedCerts();
  }

  if (!fs.existsSync(CERT_PATH) || !fs.existsSync(KEY_PATH)) {
    console.warn('[HTTPS] ⚠️ HTTPS disabled — certificate generation failed.');
    return undefined;
  }

  return {
    httpsOptions: {
      key: fs.readFileSync(KEY_PATH),
      cert: fs.readFileSync(CERT_PATH),
    },
  };
}
