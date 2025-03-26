import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

const dockerEnvPath = path.resolve(__dirname, '../../../docker/.env');
const backendEnvPath = path.resolve(__dirname, '../.env');

// Load docker/.env
if (!fs.existsSync(dockerEnvPath)) {
  throw new Error(`❌ Cannot find docker/.env at: ${dockerEnvPath}`);
}
const dockerEnv = dotenv.parse(fs.readFileSync(dockerEnvPath));

// Extract needed vars
const {
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
} = dockerEnv;

if (!POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_DB) {
  throw new Error('❌ Missing required Postgres vars in docker/.env');
}

const DATABASE_URL = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}`;

// Target vars to update
const injectedVars: Record<string, string> = {
  DATABASE_URL,
};
if (ADMIN_EMAIL) injectedVars.ADMIN_EMAIL = ADMIN_EMAIL;
if (ADMIN_PASSWORD) injectedVars.ADMIN_PASSWORD = ADMIN_PASSWORD;

// Read existing backend .env as lines
let lines: string[] = [];
if (fs.existsSync(backendEnvPath)) {
  lines = fs.readFileSync(backendEnvPath, 'utf-8').split(/\r?\n/);
}

// Track existing keys
const seenKeys = new Set<string>();

// Modify lines where needed, preserving comments
const updatedLines = lines.map((line) => {
  const match = line.match(/^([A-Z0-9_]+)=["']?(.*?)["']?$/);
  if (!match) return line; // comment or empty line

  const key = match[1];
  seenKeys.add(key);

  if (injectedVars[key] !== undefined) {
    return `${key}="${injectedVars[key]}"`;
  }

  return line;
});

// Append missing vars (if they weren’t in original file)
Object.entries(injectedVars).forEach(([key, value]) => {
  if (!seenKeys.has(key)) {
    updatedLines.push(`${key}="${value}"`);
  }
});

const output = updatedLines.join('\n') + '\n';
fs.writeFileSync(backendEnvPath, output);

console.log('✅ apps/backend/.env updated with root variables');
