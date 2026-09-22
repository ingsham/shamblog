import { listArticles, tryDb } from '@/lib/db';
import { escapeHtml } from '@/lib/markdown';
import { siteUrl, toExcerpt } from '@/lib/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const base = siteUrl();
  const articles = (await tryDb(() => listArticles({ limit: 30 }), [])) || [];

  const items = articles
    .map((article) => {
      const link = base + '/article/' + article.slug;
      return [
        '    <item>',
        '      <title>' + escapeHtml(article.title) + '</title>',
        '      <link>' + escapeHtml(link) + '</link>',
        '      <guid isPermaLink="true">' + escapeHtml(link) + '</guid>',
        '      <pubDate>' + new Date(article.published_at).toUTCString() + '</pubDate>',
        '      <category>' + escapeHtml(article.category) + '</category>',
        '      <description>' +
          escapeHtml(article.excerpt || toExcerpt(article.content, 240)) +
          '</description>',
        '    </item>',
      ].join('\n');
    })
    .join('\n');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    '  <channel>',
    '    <title>SHAM</title>',
    '    <link>' + escapeHtml(base) + '</link>',
    '    <description>Independent reporting on world affairs, business, technology, poems and sport.</description>',
    '    <language>en</language>',
    '    <lastBuildDate>' + new Date().toUTCString() + '</lastBuildDate>',
    items,
    '  </channel>',
    '</rss>',
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600',
    },
  });
}
