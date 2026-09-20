import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { ensureSchema, listArticles, one } from '@/lib/db';
import { CATEGORIES, parseTags, slugify, toExcerpt } from '@/lib/utils';

export const runtime = 'nodejs';

async function uniqueSlug(base, ignoreId = null) {
  let candidate = base;
  let n = 2;
  /* eslint-disable no-await-in-loop */
  while (true) {
    const clash = await one(
      'SELECT id FROM articles WHERE slug = $1' + (ignoreId ? ' AND id <> $2' : ''),
      ignoreId ? [candidate, ignoreId] : [candidate]
    );
    if (!clash) return candidate;
    candidate = base + '-' + n;
    n += 1;
  }
}

export async function GET(request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
  const params = new URL(request.url).searchParams;
  const articles = await listArticles({
    limit: 200,
    includeDrafts: true,
    search: params.get('q') || null,
  });
  return NextResponse.json({ articles });
}

export async function POST(request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });

  try {
    const payload = await request.json();
    const title = String(payload.title || '').trim();
    const content = String(payload.content || '').trim();
    if (!title) return NextResponse.json({ error: 'Give the story a headline.' }, { status: 400 });
    if (!content) return NextResponse.json({ error: 'The story has no body text.' }, { status: 400 });

    await ensureSchema();
    const slug = await uniqueSlug(slugify(payload.slug || title));
    const category = CATEGORIES.includes(payload.category) ? payload.category : CATEGORIES[0];

    const article = await one(
      `INSERT INTO articles
        (slug, title, subtitle, excerpt, content, cover_image, cover_credit,
         category, tags, author, status, featured, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, COALESCE($13, NOW()))
       RETURNING *`,
      [
        slug,
        title.slice(0, 200),
        String(payload.subtitle || '').slice(0, 300),
        String(payload.excerpt || toExcerpt(content)).slice(0, 400),
        content,
        String(payload.cover_image || '').slice(0, 500),
        String(payload.cover_credit || '').slice(0, 200),
        category,
        parseTags(payload.tags).join(', '),
        String(payload.author || 'SHAM').slice(0, 80),
        payload.status === 'draft' ? 'draft' : 'published',
        Boolean(payload.featured),
        payload.published_at ? new Date(payload.published_at) : null,
      ]
    );

    return NextResponse.json({ ok: true, article });
  } catch (err) {
    console.error('[sham] create failed:', err.message);
    return NextResponse.json({ error: 'Could not save: ' + err.message }, { status: 500 });
  }
}
