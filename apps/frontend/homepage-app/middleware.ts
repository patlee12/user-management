import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const publicSessionSecret = process.env.PUBLIC_SESSION_SECRET!;

const publicPaths = [
  '/',
  '/about',
  '/login',
  '/forgot-password',
  '/logout',
  '/account-requests',
  '/auth/verify-email',
  '/auth/verify-mfa',
  '/auth/mfa-help',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignore static files and public routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/assets') ||
    pathname === '/favicon.ico' ||
    pathname === '/favicon.png' ||
    pathname === '/robots.txt' ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js|woff2?)$/) ||
    publicPaths.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    )
  ) {
    return NextResponse.next();
  }

  // Read the public_session token from the non-HttpOnly cookie
  const token = req.cookies.get('public_session')?.value;

  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Convert secret string to a Uint8Array using TextEncoder
    const secret = new TextEncoder().encode(publicSessionSecret);
    await jwtVerify(token, secret);
  } catch (err) {
    console.warn('🚫 Invalid token in middleware:', err);
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};
