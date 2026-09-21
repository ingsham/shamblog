import { NextResponse } from 'next/server';
import { ensureSchema, one } from '@/lib/db';

export const runtime = 'nodejs';

const recent = new Map();

function throttled(ip) {
  const now = Date.now();
  const last = recent.get(ip) || 0;
  if (now - last < 15_000) return true;
  recent.set(ip, now);
  return false;
}

export async function POST(request) {
  try {
    const { articleId: raw, name, body, website } = await request.json();

    // Honeypot: real readers never fill this in.
    if (website) return NextResponse.json({ ok: true, comment: null });

    const articleId = Number.parseInt(raw, 10);
    const cleanName = String(name || 'Reader').trim().slice(0, 60) || 'Reader';
    const cleanBody = String(body || '').trim().slice(0, 2000);

    if (!articleId) return NextResponse.json({ error: 'Unknown article.' }, { status: 400 });
    if (cleanBody.length < 2) {
      return NextResponse.json({ error: 'Write a little more before posting.' }, { status: 400 });
    }

    const ip = request.headers.get('x-forwarded-for') || 'local';
    if (throttled(ip)) {
      return NextResponse.json(
        { error: 'Give it a few seconds before posting again.' },
        { status: 429 }
      );
    }

    await ensureSchema();
    const article = await one('SELECT id FROM articles WHERE id = $1', [articleId]);
    if (!article) return NextResponse.json({ error: 'Unknown article.' }, { status: 404 });

    const inserted = await one(
      'INSERT INTO comments (article_id, name, body) VALUES ($1, $2, $3) RETURNING *',
      [articleId, cleanName, cleanBody]
    );

    return NextResponse.json({
      ok: true,
      comment: { ...inserted, created_at: new Date(inserted.created_at).toISOString() },
    });
  } catch (err) {
    console.error('[sham] comment failed:', err.message);
    return NextResponse.json({ error: 'Comments are unavailable right now.' }, { status: 500 });
  }
}
