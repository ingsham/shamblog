import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { ensureSchema, getArticleById, one, query } from '@/lib/db';
import { CATEGORIES, parseTags, slugify } from '@/lib/utils';

export const runtime = 'nodejs';

async function uniqueSlug(base, ignoreId) {
  let candidate = base;
  let n = 2;
  /* eslint-disable no-await-in-loop */
  while (true) {
    const clash = await one('SELECT id FROM articles WHERE slug = $1 AND id <> $2', [
      candidate,
      ignoreId,
    ]);
    if (!clash) return candidate;
    candidate = base + '-' + n;
    n += 1;
  }
}

export async function GET(_request, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
  const { id } = await params;
  const article = await getArticleById(Number.parseInt(id, 10));
  if (!article) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  return NextResponse.json({ article });
}

export async function PATCH(request, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
  const { id } = await params;
  const articleId = Number.parseInt(id, 10);
  if (!articleId) return NextResponse.json({ error: 'Unknown article.' }, { status: 400 });

  try {
    const payload = await request.json();
    await ensureSchema();

    const fields = [];
    const values = [];
    const set = (column, value) => {
      values.push(value);
      fields.push(column + ' = $' + values.length);
    };

    if (typeof payload.title === 'string' && payload.title.trim()) set('title', payload.title.trim().slice(0, 200));
    if (typeof payload.subtitle === 'string') set('subtitle', payload.subtitle.slice(0, 300));
    if (typeof payload.excerpt === 'string') set('excerpt', payload.excerpt.slice(0, 400));
    if (typeof payload.content === 'string') set('content', payload.content);
    if (typeof payload.cover_image === 'string') set('cover_image', payload.cover_image.slice(0, 500));
    if (typeof payload.cover_credit === 'string') set('cover_credit', payload.cover_credit.slice(0, 200));
    if (typeof payload.author === 'string' && payload.author.trim()) set('author', payload.author.trim().slice(0, 80));
    if (typeof payload.tags === 'string' || Array.isArray(payload.tags)) set('tags', parseTags(payload.tags).join(', '));
    if (CATEGORIES.includes(payload.category)) set('category', payload.category);
    if (payload.status === 'draft' || payload.status === 'published') set('status', payload.status);
    if (typeof payload.featured === 'boolean') set('featured', payload.featured);
    if (payload.published_at) set('published_at', new Date(payload.published_at));

    // Admin override for the like total: stored as an offset on top of real likes.
    if (payload.likes !== undefined && payload.likes !== null && payload.likes !== '') {
      const target = Math.max(0, Number.parseInt(payload.likes, 10) || 0);
      const real = await one('SELECT COUNT(*)::int AS n FROM likes WHERE article_id = $1', [articleId]);
      set('like_offset', target - (real?.n || 0));
    }
    if (payload.views !== undefined && payload.views !== null && payload.views !== '') {
      set('views', Math.max(0, Number.parseInt(payload.views, 10) || 0));
    }

    if (typeof payload.slug === 'string' && payload.slug.trim()) {
      set('slug', await uniqueSlug(slugify(payload.slug), articleId));
    }

    if (fields.length === 0) return NextResponse.json({ error: 'Nothing to change.' }, { status: 400 });

    set('updated_at', new Date());
    values.push(articleId);
    await query(
      'UPDATE articles SET ' + fields.join(', ') + ' WHERE id = $' + values.length,
      values
    );

    const article = await getArticleById(articleId);
    return NextResponse.json({ ok: true, article });
  } catch (err) {
    console.error('[sham] update failed:', err.message);
    return NextResponse.json({ error: 'Could not save: ' + err.message }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
  const { id } = await params;
  const articleId = Number.parseInt(id, 10);
  if (!articleId) return NextResponse.json({ error: 'Unknown article.' }, { status: 400 });
  await ensureSchema();
  await query('DELETE FROM articles WHERE id = $1', [articleId]);
  return NextResponse.json({ ok: true });
}
