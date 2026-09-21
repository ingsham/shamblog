import { NextResponse } from 'next/server';
import { ensureSchema, query } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { articleId } = await request.json();
    const id = Number.parseInt(articleId, 10);
    if (!id) return NextResponse.json({ error: 'Unknown article.' }, { status: 400 });
    await ensureSchema();
    await query('UPDATE articles SET views = views + 1 WHERE id = $1', [id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
