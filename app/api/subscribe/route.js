import { NextResponse } from 'next/server';
import { ensureSchema, query } from '@/lib/db';

export const runtime = 'nodejs';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request) {
  try {
    const { email } = await request.json();
    const address = String(email || '').trim().toLowerCase();
    if (!EMAIL.test(address) || address.length > 160) {
      return NextResponse.json({ error: 'That does not look like an email address.' }, { status: 400 });
    }
    await ensureSchema();
    await query(
      'INSERT INTO subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING',
      [address]
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[sham] subscribe failed:', err.message);
    return NextResponse.json({ error: 'Sign-up is unavailable right now.' }, { status: 500 });
  }
}
