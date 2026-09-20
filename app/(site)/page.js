import Link from 'next/link';
import { LeadArticle, ArticleCard, RiverItem } from '@/components/ArticleCard';
import Newsletter from '@/components/Newsletter';
import { categoryCounts, listArticles, mostRead, tryDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

function SetupNotice() {
  return (
    <div className="shell" style={{ padding: '80px 20px' }}>
      <div className="empty" style={{ textAlign: 'left', maxWidth: 640, margin: '0 auto' }}>
        <h3>SHAM is up. It needs a database next.</h3>
        <p>
          Add a Postgres database to this project and set <code>DATABASE_URL</code>. On Vercel,
          open the project, go to Storage, create a Neon Postgres database and connect it — the
          variable is filled in for you. Redeploy and this page turns into your front page.
        </p>
        <p style={{ marginTop: 14 }}>
          Full steps are in the <code>README.md</code> in your repository.
        </p>
      </div>
    </div>
  );
}

function EmptyNewsroom() {
  return (
    <div className="shell" style={{ padding: '90px 20px' }}>
      <div className="empty">
        <h3>Nothing published yet</h3>
        <p>Sign in to the newsroom and write the first story.</p>
        <p style={{ marginTop: 18 }}>
          <Link href="/admin" className="button">Open the newsroom</Link>
        </p>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const articles = await tryDb(() => listArticles({ limit: 13 }), null);
  if (articles === null) return <SetupNotice />;
  if (articles.length === 0) return <EmptyNewsroom />;

  const [lead, ...rest] = articles;
  const highlights = rest.slice(0, 3);
  const river = rest.slice(3);
  const popular = (await tryDb(() => mostRead(5), [])) || [];
  const sections = (await tryDb(() => categoryCounts(), [])) || [];

  return (
    <div className="shell">
      <LeadArticle article={lead} />

      {highlights.length > 0 ? (
        <section className="section-block">
          <div className="section-head">
            <h2>Also today</h2>
            <Link href="/search">Browse everything</Link>
          </div>
          <div className="grid-3">
            {highlights.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="section-block">
        <div className="with-aside">
          <div>
            {river.length > 0 ? (
              <>
                <div className="section-head">
                  <h2>More stories</h2>
                </div>
                <div className="river">
                  {river.map((article, index) => (
                    <RiverItem key={article.id} article={article} index={index + 1} />
                  ))}
                </div>
              </>
            ) : null}
          </div>

          <aside>
            {popular.length > 0 ? (
              <div className="aside-block">
                <h3>Most read</h3>
                <ol className="rank-list">
                  {popular.map((item, index) => (
                    <li key={item.id}>
                      <span className="rank-n">{index + 1}</span>
                      <Link href={'/article/' + item.slug}>{item.title}</Link>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            {sections.length > 0 ? (
              <div className="aside-block">
                <h3>Sections</h3>
                <div className="tag-row">
                  {sections.map((section) => (
                    <Link
                      key={section.category}
                      href={'/category/' + section.category.toLowerCase()}
                      className="tag"
                    >
                      {section.category} · {section.n}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </section>

      <Newsletter />
    </div>
  );
}
