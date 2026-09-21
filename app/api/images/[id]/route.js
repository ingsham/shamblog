import { NextResponse } from 'next/server';
import { ensureSchema, one } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(_request, { params }) {
  const { id } = await params;
  try {
    await ensureSchema();
    const image = await one('SELECT mime, bytes FROM images WHERE id = $1', [id]);
    if (!image) return new NextResponse('Not found', { status: 404 });

    // Image ids are random and never reused, so they can be cached forever.
    return new NextResponse(Buffer.from(image.bytes), {
      status: 200,
      headers: {
        'Content-Type': image.mime,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': String(image.bytes.length),
      },
    });
  } catch (err) {
    console.error('[sham] image fetch failed:', err.message);
    return new NextResponse('Unavailable', { status: 500 });
  }
}
