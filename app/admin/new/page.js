import AdminNav from '@/components/AdminNav';
import ArticleEditor from '@/components/ArticleEditor';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function NewArticlePage() {
  await requireAdmin('/admin/new');
  return (
    <>
      <AdminNav />
      <div className="shell" style={{ paddingBottom: 70 }}>
        <ArticleEditor />
      </div>
    </>
  );
}
