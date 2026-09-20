import AdminNav from '@/components/AdminNav';
import AdminComments from '@/components/AdminComments';
import { requireAdmin } from '@/lib/auth';
import { ensureSchema, rows, tryDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminCommentsPage() {
  await requireAdmin('/admin/comments');

  const comments =
    (await tryDb(
      async () => {
        await ensureSchema();
        return rows(`
          SELECT c.*, a.title AS article_title, a.slug AS article_slug
          FROM comments c
          JOIN articles a ON a.id = c.article_id
          ORDER BY c.created_at DESC
          LIMIT 300
        `);
      },
      []
    )) || [];

  const serialised = comments.map((c) => ({
    ...c,
    created_at: new Date(c.created_at).toISOString(),
  }));

  return (
    <>
      <AdminNav />
      <div className="shell" style={{ paddingBottom: 70 }}>
        <h1 className="admin-title">Comments</h1>
        <p className="admin-sub">
          Edit what a reader wrote, pin the good ones, hide the rest. Hidden comments stay out of
          sight on the site but remain here.
        </p>
        <AdminComments comments={serialised} />
      </div>
    </>
  );
}
