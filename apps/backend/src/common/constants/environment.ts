export const isProd = process.env.NODE_ENV?.toLowerCase() === 'production';
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
export const EMAIL_USER = process.env.EMAIL_USER;
export const AVAHI_HOSTNAME = process.env.AVAHI_HOSTNAME;
export const DOMAIN_HOST = process.env.DOMAIN_HOST;
export const FRONTEND_URL =
  process.env.FRONTEND_URL || 'https://localhost:3000';
export const MFA_KEY = process.env.MFA_KEY;
export const JWT_SECRET = process.env.JWT_SECRET;
export const PUBLIC_SESSION_SECRET = process.env.PUBLIC_SESSION_SECRET;
