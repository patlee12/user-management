import { execSync } from 'child_process';
import { existsSync } from 'fs';

const localConfig = 'tsconfig.json';
const rootConfig = 'apps/backend/tsconfig.json';

const tsconfigPath = existsSync(localConfig) ? localConfig : rootConfig;

execSync(`ts-node -P ${tsconfigPath} prisma/seed.ts`, {
  stdio: 'inherit',
});
