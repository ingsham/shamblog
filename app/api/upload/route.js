import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { ensureSchema, query } from '@/lib/db';

export const runtime = 'nodejs';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });

  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!file || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ error: 'Choose an image file.' }, { status: 400 });
    }
    const mime = file.type || 'image/jpeg';
    if (!ALLOWED.includes(mime)) {
      return NextResponse.json(
        { error: 'Use a JPEG, PNG, WebP, AVIF or GIF image.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length > MAX_BYTES) {
      return NextResponse.json(
        { error: 'That image is over 4 MB even after resizing. Try a smaller one.' },
        { status: 413 }
      );
    }

    await ensureSchema();
    const extension = mime.split('/')[1].replace('jpeg', 'jpg');
    const id = crypto.randomBytes(9).toString('hex') + '.' + extension;
    await query('INSERT INTO images (id, mime, bytes) VALUES ($1, $2, $3)', [id, mime, buffer]);

    return NextResponse.json({ ok: true, url: '/api/images/' + id, bytes: buffer.length });
  } catch (err) {
    console.error('[sham] upload failed:', err.message);
    return NextResponse.json({ error: 'Upload failed: ' + err.message }, { status: 500 });
  }
}
