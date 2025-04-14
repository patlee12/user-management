import { createServer } from 'https';
import { parse } from 'url';
import next from 'next';
import fs from 'fs';
import path from 'path';
import type { IncomingMessage, ServerResponse } from 'http';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = parseInt(process.env.PORT || '3000', 10);

const certDir = path.join(__dirname, '../../../apps/backend/dist/certs');
const certPath = path.join(certDir, 'localhost.pem');
const keyPath = path.join(certDir, 'localhost-key.pem');

// Check if certs exist and are readable
function certsReady(): boolean {
  try {
    return (
      fs.statSync(certPath).isFile() &&
      fs.statSync(keyPath).isFile() &&
      fs.readFileSync(certPath).length > 0 &&
      fs.readFileSync(keyPath).length > 0
    );
  } catch {
    return false;
  }
}

// Wait for certs to appear (polling)
async function waitForCerts(timeout = 7000, interval = 100): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      if (certsReady()) return resolve();
      if (Date.now() - start > timeout)
        return reject(new Error('Timeout waiting for certs'));
      setTimeout(check, interval);
    };
    check();
  });
}

app.prepare().then(async () => {
  try {
    console.log('🔃 Waiting for HTTPS certs to become available...');
    await waitForCerts();

    const httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };

    createServer(httpsOptions, (req: IncomingMessage, res: ServerResponse) => {
      const parsedUrl = parse(req.url || '', true);
      handle(req, res, parsedUrl);
    }).listen(port, () => {
      console.log(
        `✅ Next.js HTTPS dev server running at https://localhost:${port}`,
      );
    });
  } catch (err) {
    if (err instanceof Error) {
      console.error(`[HTTPS] ❌ Failed to find certs: ${err.message}`);
    } else {
      console.error('[HTTPS] ❌ Failed to find certs:', err);
    }
    process.exit(1);
  }
});
