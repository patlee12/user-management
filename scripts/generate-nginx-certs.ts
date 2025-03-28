import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const certDir = path.resolve(process.cwd(), 'docker/nginx/certs');
const keyPath = path.join(certDir, 'nginx-selfsigned.key');
const certPath = path.join(certDir, 'nginx-selfsigned.crt');

// Ensure cert directory exists
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
  console.log(`📁 Created cert directory: ${certDir}`);
}

// Only generate if files don’t exist
if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  console.log('🔒 Nginx certs already exist, skipping generation.');
} else {
  console.log('🔧 Generating new self-signed certs for Nginx...');

  const command = [
    'openssl req -x509 -nodes -days 365',
    '-newkey rsa:2048',
    `-keyout "${keyPath}"`,
    `-out "${certPath}"`,
    '-subj "/C=US/ST=State/L=City/O=Company/CN=localhost"',
  ].join(' ');

  try {
    execSync(command, { stdio: 'inherit', shell: '/bin/bash' });
    console.log('✅ Self-signed certs generated successfully.');
  } catch (err) {
    console.error('❌ Failed to generate certs:', err);
    process.exit(1);
  }
}
