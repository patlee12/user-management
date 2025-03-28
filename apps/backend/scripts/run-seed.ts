import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

const env = process.env.NODE_ENV || 'Development';
console.log(`🌱 Running seed script in ${env} mode...`);

const isProduction = env === 'Production';

const tsconfigPath = isProduction
  ? 'apps/backend/tsconfig.json'
  : existsSync('tsconfig.json')
    ? 'tsconfig.json'
    : 'apps/backend/tsconfig.json';

const possibleSeedPaths = [
  'apps/backend/prisma/seed.ts',
  'prisma/seed.ts',
  path.resolve(__dirname, '../apps/backend/prisma/seed.ts'), // useful in Docker
  path.resolve(__dirname, '../prisma/seed.ts'),
];

const seedScriptPath =
  possibleSeedPaths.find((p) => existsSync(p)) ||
  (() => {
    throw new Error('❌ Could not find seed.ts in expected paths.');
  })();

console.log(`🛠️ Using tsconfig: ${tsconfigPath}`);
console.log(`🌱 Running seed script: ${seedScriptPath}`);

execSync(`ts-node -P ${tsconfigPath} ${seedScriptPath}`, {
  stdio: 'inherit',
});
