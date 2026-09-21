import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { ensureSchema, one, query } from '@/lib/db';

export const runtime = 'nodejs';

export async function PATCH(request, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
  const { id } = await params;
  const commentId = Number.parseInt(id, 10);
  if (!commentId) return NextResponse.json({ error: 'Unknown comment.' }, { status: 400 });

  const payload = await request.json();
  const fields = [];
  const values = [];

  if (typeof payload.body === 'string') {
    values.push(payload.body.trim().slice(0, 2000));
    fields.push('body = $' + values.length);
  }
  if (typeof payload.name === 'string') {
    values.push(payload.name.trim().slice(0, 60) || 'Reader');
    fields.push('name = $' + values.length);
  }
  if (typeof payload.approved === 'boolean') {
    values.push(payload.approved);
    fields.push('approved = $' + values.length);
  }
  if (typeof payload.pinned === 'boolean') {
    values.push(payload.pinned);
    fields.push('pinned = $' + values.length);
  }
  if (fields.length === 0) {
    return NextResponse.json({ error: 'Nothing to change.' }, { status: 400 });
  }

  await ensureSchema();
  values.push(commentId);
  const updated = await one(
    'UPDATE comments SET ' + fields.join(', ') + ' WHERE id = $' + values.length + ' RETURNING *',
    values
  );
  return NextResponse.json({ ok: true, comment: updated });
}

export async function DELETE(_request, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
  const { id } = await params;
  const commentId = Number.parseInt(id, 10);
  if (!commentId) return NextResponse.json({ error: 'Unknown comment.' }, { status: 400 });
  await ensureSchema();
  await query('DELETE FROM comments WHERE id = $1', [commentId]);
  return NextResponse.json({ ok: true });
}
