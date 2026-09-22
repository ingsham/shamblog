import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { ensureSchema, one, rows } from '@/lib/db';

export const runtime = 'nodejs';

const KINDS = new Set(['submission', 'question', 'support']);

const recent = new Map();

function throttled(ip) {
  const now = Date.now();
  const last = recent.get(ip) || 0;
  if (now - last < 15_000) return true;
  recent.set(ip, now);
  return false;
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
  await ensureSchema();
  const messages = await rows('SELECT * FROM messages ORDER BY read ASC, created_at DESC LIMIT 300');
  return NextResponse.json({ messages });
}

export async function POST(request) {
  try {
    const { name, email, subject, body, kind, website } = await request.json();

    // Honeypot: real visitors never fill this in.
    if (website) return NextResponse.json({ ok: true, message: null });

    const cleanName = String(name || '').trim().slice(0, 80);
    const cleanEmail = String(email || '').trim().slice(0, 200);
    const cleanSubject = String(subject || '').trim().slice(0, 200);
    const cleanBody = String(body || '').trim().slice(0, 4000);
    const cleanKind = KINDS.has(kind) ? kind : 'question';

    if (!cleanName) return NextResponse.json({ error: 'Tell us your name.' }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json({ error: 'That does not look like a working email address.' }, { status: 400 });
    }
    if (cleanBody.length < 10) {
      return NextResponse.json({ error: 'Write a little more so the desk knows what you need.' }, { status: 400 });
    }

    const ip = request.headers.get('x-forwarded-for') || 'local';
    if (throttled(ip)) {
      return NextResponse.json(
        { error: 'Give it a few seconds before sending another message.' },
        { status: 429 }
      );
    }

    await ensureSchema();
    const inserted = await one(
      `INSERT INTO messages (kind, name, email, subject, body)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [cleanKind, cleanName, cleanEmail, cleanSubject, cleanBody]
    );

    return NextResponse.json({
      ok: true,
      message: { ...inserted, created_at: new Date(inserted.created_at).toISOString() },
    });
  } catch (err) {
    console.error('[sham] message failed:', err.message);
    return NextResponse.json({ error: 'Messages are unavailable right now.' }, { status: 500 });
  }
}
