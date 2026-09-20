import Link from 'next/link';
import AdminNav from '@/components/AdminNav';
import AdminArticleTable from '@/components/AdminArticleTable';
import { requireAdmin } from '@/lib/auth';
import { adminStats, listArticles, tryDb } from '@/lib/db';
import { IconPlus } from '@/components/Icons';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  await requireAdmin('/admin');

  const stats = await tryDb(() => adminStats(), null);
  const articles = (await tryDb(() => listArticles({ limit: 100, includeDrafts: true }), [])) || [];

  if (!stats) {
    return (
      <>
        <AdminNav />
        <div className="shell" style={{ paddingTop: 40 }}>
          <div className="notice notice-error">
            The database is not reachable. Check that <code>DATABASE_URL</code> is set on this
            project, then redeploy. The README has the steps.
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
