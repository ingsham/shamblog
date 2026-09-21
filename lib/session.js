import crypto from 'node:crypto';

export const SESSION_COOKIE = 'sham_session';
export const VISITOR_COOKIE = 'sham_visitor';
const SESSION_DAYS = 14;

function secret() {
  return (
    process.env.ADMIN_SECRET ||
    process.env.ADMIN_PASSWORD ||
    'sham-development-secret-change-me'
  );
}

export function adminPassword() {
  return process.env.ADMIN_PASSWORD || 'sham-admin';
}

function sign(payload) {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function createToken(days = SESSION_DAYS) {
  const expires = Date.now() + days * 24 * 60 * 60 * 1000;
  const payload = 'admin.' + expires;
  return payload + '.' + sign(payload);
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [role, expires, signature] = parts;
  if (role !== 'admin') return false;
  if (!/^\d+$/.test(expires)) return false;
  const a = Buffer.from(signature);
  const b = Buffer.from(sign(role + '.' + expires));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  return Number(expires) > Date.now();
}

export function checkPassword(candidate) {
  const expected = adminPassword();
  const a = Buffer.from(String(candidate || ''));
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  };
}

export function newVisitorId() {
  return crypto.randomUUID();
}
