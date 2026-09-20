import { RiverItem } from '@/components/ArticleCard';
import SearchForm from '@/components/SearchForm';
import { listArticles, tryDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Search',
  description: 'Search everything SHAM has published.',
};

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const term = typeof params?.q === 'string' ? params.q.trim() : '';
  const articles = term
    ? (await tryDb(() => listArticles({ search: term, limit: 40 }), [])) || []
    : (await tryDb(() => listArticles({ limit: 40 }), [])) || [];

  return (
    <div className="shell" style={{ paddingBottom: 40 }}>
      <header style={{ padding: '54px 0 26px' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', letterSpacing: '-0.045em' }}>
          {term ? 'Results for “' + term + '”' : 'Everything we have published'}
        </h1>
        <div style={{ marginTop: 22, maxWidth: 520 }}>
          <SearchForm initialQuery={term} />
        </div>
      </header>

      {articles.length === 0 ? (
        <div className="empty">
          <h3>No matches</h3>
          <p>Try a shorter phrase, or browse a section from the menu.</p>
        </div>
      ) : (
        <div className="river">
          {articles.map((article, index) => (
            <RiverItem key={article.id} article={article} index={index + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
