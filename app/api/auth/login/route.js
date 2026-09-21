import { NextResponse } from 'next/server';
import { SESSION_COOKIE, checkPassword, createToken, sessionCookieOptions } from '@/lib/auth';

export const runtime = 'nodejs';

// Small in-memory throttle: enough to blunt password guessing on a warm instance.
const attempts = new Map();

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for') || 'local';
  const now = Date.now();
  const record = attempts.get(ip) || { count: 0, until: 0 };
  if (record.until > now) {
    return NextResponse.json(
      { error: 'Too many attempts. Wait a minute and try again.' },
      { status: 429 }
    );
  }

  let password = '';
  try {
    const body = await request.json();
    password = body?.password || '';
  } catch (err) {
    return NextResponse.json({ error: 'Send a password.' }, { status: 400 });
  }

  if (!checkPassword(password)) {
    record.count += 1;
    if (record.count >= 6) {
      record.count = 0;
      record.until = now + 60_000;
    }
    attempts.set(ip, record);
    return NextResponse.json({ error: 'That password does not match.' }, { status: 401 });
  }

  attempts.delete(ip);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, createToken(), sessionCookieOptions());
  return response;
}
