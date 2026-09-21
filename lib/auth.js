import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, verifyToken } from '@/lib/session';

export {
  SESSION_COOKIE,
  VISITOR_COOKIE,
  adminPassword,
  checkPassword,
  createToken,
  newVisitorId,
  sessionCookieOptions,
  verifyToken,
} from '@/lib/session';

export async function isAdmin() {
  const store = await cookies();
  return verifyToken(store.get(SESSION_COOKIE)?.value);
}

export async function requireAdmin(returnTo = '/admin') {
  if (!(await isAdmin())) {
    redirect('/admin/login?next=' + encodeURIComponent(returnTo));
  }
}
