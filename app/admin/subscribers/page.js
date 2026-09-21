import AdminNav from '@/components/AdminNav';
import { requireAdmin } from '@/lib/auth';
import { rows, tryDb } from '@/lib/db';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function SubscribersPage() {
  await requireAdmin('/admin/subscribers');

  const subscribers =
    (await tryDb(() => rows('SELECT * FROM subscribers ORDER BY created_at DESC LIMIT 1000'), [])) ||
    [];

  return (
    <>
      <AdminNav />
      <div className="shell" style={{ paddingBottom: 70 }}>
        <h1 className="admin-title">Subscribers</h1>
        <p className="admin-sub">
          {subscribers.length} {subscribers.length === 1 ? 'person has' : 'people have'} signed up
          for the Friday email. Copy the list into whatever you send it with.
        </p>

        {subscribers.length === 0 ? (
          <div className="empty">
            <h3>No sign-ups yet</h3>
            <p>The form sits at the foot of the front page and every story.</p>
          </div>
        ) : (
          <>
            <div className="panel" style={{ marginBottom: 22 }}>
              <h3>All addresses</h3>
              <textarea
                className="input textarea"
                readOnly
                value={subscribers.map((s) => s.email).join(', ')}
                style={{ minHeight: 90 }}
                aria-label="All subscriber addresses"
              />
            </div>
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Signed up</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((s) => (
                    <tr key={s.id}>
                      <td>{s.email}</td>
                      <td>{formatDate(s.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}
