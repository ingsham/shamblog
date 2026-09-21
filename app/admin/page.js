import Link from 'next/link';
import AdminNav from '@/components/AdminNav';
import AdminArticleTable from '@/components/AdminArticleTable';
import { requireAdmin } from '@/lib/auth';
import { adminStats, listArticles, tryDb, tryDbDetailed } from '@/lib/db';
import { IconPlus } from '@/components/Icons';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  await requireAdmin('/admin');

  const { data: stats, error: dbError } = await tryDbDetailed(() => adminStats());
  const articles = (await tryDb(() => listArticles({ limit: 100, includeDrafts: true }), [])) || [];

  if (!stats) {
    return (
      <>
        <AdminNav />
        <div className="shell" style={{ paddingTop: 40, maxWidth: 680 }}>
          <div className="notice notice-error">
            <strong>The database is not reachable.</strong>
            {dbError ? (
              <>
                <br />
                The connection failed with: <code>{dbError}</code>
              </>
            ) : null}
          </div>
          <div style={{ marginTop: 24 }}>
            <h3 style={{ marginBottom: 12 }}>Things to check, in order</h3>
            <ol style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 10, color: 'var(--ink-soft)' }}>
              <li>
                <strong style={{ color: 'var(--ink)' }}>Is a database actually connected?</strong> In
                Vercel: your project → <strong>Storage</strong>. If nothing is listed, add one
                (Storage → Create Database → Postgres) and connect it to this project.
              </li>
              <li>
                <strong style={{ color: 'var(--ink)' }}>Is the variable set on Production?</strong>{' '}
                Project → <strong>Settings → Environment Variables</strong>. Connecting a database
                from the Storage tab should add <code>DATABASE_URL</code> (or <code>POSTGRES_URL</code>)
                automatically — confirm it appears there with the{' '}
                <strong>Production</strong> box checked, not just Preview or Development.
              </li>
              <li>
                <strong style={{ color: 'var(--ink)' }}>Did you redeploy after adding it?</strong>{' '}
                Environment variables only take effect on the next build. Go to{' '}
                <strong>Deployments</strong>, open the latest one, and use{' '}
                <strong>⋯ → Redeploy</strong>.
              </li>
              <li>
                <strong style={{ color: 'var(--ink)' }}>
                  If you pasted in your own connection string
                </strong>{' '}
                (Neon, Supabase, Railway, etc.), make sure it is the real value and not the
                placeholder text from <code>.env.example</code>, and that it still has{' '}
                <code>?sslmode=require</code> at the end if your provider gave it one.
              </li>
            </ol>
            <p style={{ marginTop: 16, fontSize: '0.9rem', color: 'var(--ink-faint)' }}>
              The exact error above is the fastest way to tell which of these it is —
              &quot;password authentication failed&quot; and &quot;ENOTFOUND&quot; both mean the
              string itself is wrong; a timeout usually means step 3 (not yet redeployed).
            </p>
          </div>
        </div>
      </>
    );
  }

  const serialised = articles.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    category: a.category,
    status: a.status,
    featured: a.featured,
    views: a.views,
    likes: Number(a.likes),
    comment_count: Number(a.comment_count),
    published_at: new Date(a.published_at).toISOString(),
  }));

  const cards = [
    { label: 'Stories', value: stats.articles },
    { label: 'Published', value: stats.published },
    { label: 'Total views', value: stats.views },
    { label: 'Comments', value: stats.comments },
  ];

  return (
    <>
      <AdminNav />
      <div className="shell" style={{ paddingBottom: 60 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 className="admin-title">Newsroom</h1>
            <p className="admin-sub">Everything you have written, and how it is doing.</p>
          </div>
          <Link href="/admin/new" className="button" style={{ marginLeft: 'auto', marginBottom: 28 }}>
            <IconPlus width={16} height={16} aria-hidden="true" />
            Write a story
          </Link>
        </div>

        <div className="stat-grid">
          {cards.map((card) => (
            <div className="stat" key={card.label}>
              <div className="stat-value">{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </div>
          ))}
        </div>

        {serialised.length === 0 ? (
          <div className="empty">
            <h3>No stories yet</h3>
            <p>Your first piece is one click away.</p>
            <p style={{ marginTop: 18 }}>
              <Link href="/admin/new" className="button">Write a story</Link>
            </p>
          </div>
        ) : (
          <AdminArticleTable articles={serialised} />
        )}
      </div>
    </>
  );
}
