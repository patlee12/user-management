import fs from 'fs';
import path from 'path';

// Path relative to where this script is located
const ENV_FILE = path.resolve(__dirname, '../../../frontend/homepage-app/.env');

/**
 * This will update `NEXT_PUBLIC_BACKEND_URL` in the `frontend/homepage-app/.env` file with the current local area network ip. Only in development.
 * @param key
 * @param value
 */
export async function updateFrontendEnv(
  key: string,
  value: string,
): Promise<void> {
  let content = '';
  let updated = false;

  if (fs.existsSync(ENV_FILE)) {
    const lines = fs.readFileSync(ENV_FILE, 'utf8').split('\n');

    const newLines = lines.map((line) => {
      if (line.trim().startsWith(`${key}=`)) {
        updated = true;
        return `${key}=${value}`;
      }
      return line;
    });

    if (!updated) {
      newLines.push(`${key}=${value}`);
    }

    content = newLines.join('\n');
  } else {
    // File doesn't exist yet, create it
    content = `${key}=${value}\n`;
  }

  await fs.writeFileSync(ENV_FILE, content, 'utf8');
  console.log(`${updated ? 'Updated' : 'Added'} ${key} in ${ENV_FILE}`);
}
