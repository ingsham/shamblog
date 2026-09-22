import { listArticles, tryDb } from '@/lib/db';
import { CATEGORIES, siteUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const base = siteUrl();
  const articles = (await tryDb(() => listArticles({ limit: 500 }), [])) || [];

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'hourly', priority: 1 },
    { url: base + '/about', changeFrequency: 'yearly', priority: 0.3 },
    { url: base + '/contact', changeFrequency: 'yearly', priority: 0.3 },
    { url: base + '/search', changeFrequency: 'daily', priority: 0.4 },
    ...CATEGORIES.map((name) => ({
      url: base + '/category/' + name.toLowerCase(),
      changeFrequency: 'daily',
      priority: 0.6,
    })),
    ...articles.map((article) => ({
      url: base + '/article/' + article.slug,
      lastModified: new Date(article.updated_at),
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
  ];
}
