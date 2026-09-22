import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { ensureSchema, one, query } from '@/lib/db';

export const runtime = 'nodejs';

export async function PATCH(request, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
  const { id } = await params;
  const messageId = Number.parseInt(id, 10);
  if (!messageId) return NextResponse.json({ error: 'Unknown message.' }, { status: 400 });

  const payload = await request.json();
  if (typeof payload.read !== 'boolean') {
    return NextResponse.json({ error: 'Nothing to change.' }, { status: 400 });
  }

  await ensureSchema();
  const updated = await one(
    'UPDATE messages SET read = $1 WHERE id = $2 RETURNING *',
    [payload.read, messageId]
  );
  if (!updated) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  return NextResponse.json({ ok: true, message: updated });
}

export async function DELETE(_request, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
  const { id } = await params;
  const messageId = Number.parseInt(id, 10);
  if (!messageId) return NextResponse.json({ error: 'Unknown message.' }, { status: 400 });
  await ensureSchema();
  await query('DELETE FROM messages WHERE id = $1', [messageId]);
  return NextResponse.json({ ok: true });
}
