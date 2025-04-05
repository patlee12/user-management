import * as net from 'net';

/**
 * Checks if a TCP port is open on the specified host.
 *
 * @param port - The TCP port to check.
 * @param host - The host to connect to (default is '127.0.0.1').
 * @returns A Promise that resolves to true if the port is open, or false if not.
 */
export async function isPortOpen(
  port: number,
  host = '127.0.0.1',
): Promise<boolean> {
  return await new Promise((resolve) => {
    const socket = new net.Socket();

    socket
      .setTimeout(1000)
      .once('connect', () => {
        socket.destroy();
        resolve(true);
      })
      .once('error', () => resolve(false))
      .once('timeout', () => resolve(false))
      .connect(port, host);
  });
}

/**
 * Waits for a TCP port to become available, retrying every second up to a timeout.
 *
 * @param port - The TCP port to wait for.
 * @param host - The host to connect to (default is '127.0.0.1').
 * @param timeoutMs - Maximum time to wait in milliseconds (default: 60_000ms = 1 minute).
 */
export async function waitForPortOpen(
  port: number,
  host = '127.0.0.1',
  timeoutMs = 60_000,
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const open = await isPortOpen(port, host);
    if (open) {
      return;
    }
    await new Promise((res) => setTimeout(res, 1000)); // wait 1 second before retrying
  }

  throw new Error(`Timed out waiting for port ${port} to open on ${host}`);
}
