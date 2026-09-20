import { notFound } from 'next/navigation';
import { ArticleCard } from '@/components/ArticleCard';
import { listArticles, tryDb } from '@/lib/db';
import { CATEGORIES, categoryHue } from '@/lib/utils';

export const dynamic = 'force-dynamic';

function resolve(slug) {
  return CATEGORIES.find((name) => name.toLowerCase() === String(slug).toLowerCase());
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = resolve(slug);
  if (!category) return { title: 'Section not found' };
  return {
    title: category,
    description: 'Every SHAM story filed under ' + category + '.',
    alternates: { canonical: '/category/' + category.toLowerCase() },
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const category = resolve(slug);
  if (!category) notFound();

  const articles = (await tryDb(() => listArticles({ category, limit: 30 }), [])) || [];

  return (
    <div className="shell" style={{ '--hue': categoryHue(category) }}>
      <header style={{ padding: '54px 0 26px', borderBottom: '2px solid var(--ink)' }}>
        <span className="kicker">Section</span>
        <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 3.6rem)', marginTop: 12, letterSpacing: '-0.045em' }}>
          {category}
        </h1>
        <p style={{ color: 'var(--ink-soft)', marginTop: 10 }}>
          {articles.length} {articles.length === 1 ? 'story' : 'stories'}
        </p>
      </header>

      <div style={{ paddingTop: 36 }}>
        {articles.length === 0 ? (
          <div className="empty">
            <h3>This section is waiting for its first story</h3>
            <p>Check back soon, or browse another section from the menu above.</p>
          </div>
        ) : (
          <div className="grid-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
