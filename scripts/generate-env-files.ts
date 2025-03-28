import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

type EnvMap = Record<string, string>;

function runOpenSSL(command: string): string {
  return execSync(command, { shell: '/bin/bash' }).toString().trim();
}

function readEnvTemplate(filePath: string): string[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Template file not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf-8').split(/\r?\n/);
}

function generateEnvFromTemplate(lines: string[], updates: EnvMap): string[] {
  return lines.map((line) => {
    const match = line.match(/^([A-Z0-9_]+)\s*=\s*.*$/);
    if (match) {
      const key = match[1];
      if (key in updates) {
        return `${key}="${updates[key]}"`;
      }
    }
    return line;
  });
}

function writeEnvFile(filePath: string, lines: string[]) {
  fs.writeFileSync(filePath, lines.join('\n') + '\n');
  console.log(`✅ Generated: ${filePath}`);
}

// === Paths
const dockerTemplatePath = path.resolve(process.cwd(), 'docker/.env.template');
const backendTemplatePath = path.resolve(
  process.cwd(),
  'apps/backend/.env.template',
);
const frontendTemplatePath = path.resolve(
  process.cwd(),
  'apps/frontend/homepage-app/.env.template',
);

const dockerEnvPath = path.resolve(process.cwd(), 'docker/.env');
const backendEnvPath = path.resolve(process.cwd(), 'apps/backend/.env');
const frontendEnvPath = path.resolve(
  process.cwd(),
  'apps/frontend/homepage-app/.env',
);

// === Secure password generation
const POSTGRES_PASSWORD = runOpenSSL(
  `bash -c "openssl rand -base64 48 | tr -dc 'A-Za-z0-9!@#$%^&*()_+=' | head -c 32"`,
);
const ADMIN_PASSWORD = runOpenSSL(
  `bash -c "openssl rand -base64 48 | tr -dc 'A-Za-z0-9!@#$%^&*()_+=' | head -c 32"`,
);
const JWT_SECRET = runOpenSSL('openssl rand -base64 256');
const MFA_KEY = runOpenSSL('openssl rand -hex 256');
const COOKIE_SECRET = runOpenSSL('openssl rand -base64 256');

// === Docker .env (with both passwords)
const dockerUpdates: EnvMap = {
  POSTGRES_PASSWORD,
  ADMIN_PASSWORD,
};
const dockerTemplateLines = readEnvTemplate(dockerTemplatePath);
const dockerEnvLines = generateEnvFromTemplate(
  dockerTemplateLines,
  dockerUpdates,
);
writeEnvFile(dockerEnvPath, dockerEnvLines);

// === Backend .env (no ADMIN_PASSWORD)
const backendUpdates: EnvMap = {
  POSTGRES_PASSWORD,
  JWT_SECRET,
  MFA_KEY,
  COOKIE_SECRET,
};
const backendTemplateLines = readEnvTemplate(backendTemplatePath);
const backendEnvLines = generateEnvFromTemplate(
  backendTemplateLines,
  backendUpdates,
);
writeEnvFile(backendEnvPath, backendEnvLines);

// === Frontend .env (copied as-is)
const frontendTemplateLines = readEnvTemplate(frontendTemplatePath);
writeEnvFile(frontendEnvPath, frontendTemplateLines);
