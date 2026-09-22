import AdminNav from '@/components/AdminNav';
import AdminMessages from '@/components/AdminMessages';
import { requireAdmin } from '@/lib/auth';
import { ensureSchema, rows, tryDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminMessagesPage() {
  await requireAdmin('/admin/messages');

  const messages =
    (await tryDb(async () => {
      await ensureSchema();
      return rows('SELECT * FROM messages ORDER BY read ASC, created_at DESC LIMIT 300');
    }, [])) || [];

  const serialised = messages.map((m) => ({
    ...m,
    created_at: new Date(m.created_at).toISOString(),
  }));

  return (
    <>
      <AdminNav />
      <div className="shell" style={{ paddingBottom: 70 }}>
        <h1 className="admin-title">Messages</h1>
        <p className="admin-sub">
          Article submissions, questions and support requests sent from the Message us page.
        </p>
        <AdminMessages messages={serialised} />
      </div>
    </>
  );
}
