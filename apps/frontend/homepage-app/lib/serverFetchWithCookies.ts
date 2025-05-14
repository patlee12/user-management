import { cookies } from 'next/headers';

const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!NEXT_PUBLIC_BACKEND_URL) {
  throw new Error('Missing NEXT_PUBLIC_BACKEND_URL in environment variables');
}

if ((process.env.NODE_ENV || '').toLowerCase() === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  // Suppress warning output (only in dev)
  process.removeAllListeners('warning');
}

export async function serverFetchWithCookies<T = unknown>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const fullUrl = url.startsWith('http')
    ? url
    : `${NEXT_PUBLIC_BACKEND_URL}${url}`;

  const cookieHeader = (await cookies())
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  const response = await fetch(fullUrl, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      Cookie: cookieHeader,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Fetch failed (${response.status}): ${errorText}`);
  }

  return response.json();
}
