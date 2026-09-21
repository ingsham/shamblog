import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { VISITOR_COOKIE, newVisitorId } from '@/lib/auth';
import { ensureSchema, one, query } from '@/lib/db';

export const runtime = 'nodejs';

async function totals(articleId, visitorId) {
  const row = await one(
    `SELECT
       (SELECT like_offset FROM articles WHERE id = $1) +
       (SELECT COUNT(*)::int FROM likes WHERE article_id = $1) AS likes,
       EXISTS (SELECT 1 FROM likes WHERE article_id = $1 AND visitor_id = $2) AS liked`,
    [articleId, visitorId]
  );
  return { likes: Number(row?.likes || 0), liked: Boolean(row?.liked) };
}

export async function GET(request) {
  try {
    const articleId = Number.parseInt(new URL(request.url).searchParams.get('articleId'), 10);
    if (!articleId) return NextResponse.json({ error: 'Unknown article.' }, { status: 400 });
    await ensureSchema();
    const store = await cookies();
    const visitorId = store.get(VISITOR_COOKIE)?.value || '';
    return NextResponse.json(await totals(articleId, visitorId));
  } catch (err) {
    return NextResponse.json({ error: 'Likes are unavailable.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { articleId: raw } = await request.json();
    const articleId = Number.parseInt(raw, 10);
    if (!articleId) return NextResponse.json({ error: 'Unknown article.' }, { status: 400 });

    await ensureSchema();
    const store = await cookies();
    let visitorId = store.get(VISITOR_COOKIE)?.value;
    let isNewVisitor = false;
    if (!visitorId) {
      visitorId = newVisitorId();
      isNewVisitor = true;
    }

    const existing = await one('SELECT id FROM likes WHERE article_id = $1 AND visitor_id = $2', [
      articleId,
      visitorId,
    ]);
    if (existing) {
      await query('DELETE FROM likes WHERE id = $1', [existing.id]);
    } else {
      await query(
        'INSERT INTO likes (article_id, visitor_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [articleId, visitorId]
      );
    }

    const response = NextResponse.json(await totals(articleId, visitorId));
    if (isNewVisitor) {
      response.cookies.set(VISITOR_COOKIE, visitorId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    return response;
  } catch (err) {
    console.error('[sham] like failed:', err.message);
    return NextResponse.json({ error: 'That like did not register.' }, { status: 500 });
  }
}
