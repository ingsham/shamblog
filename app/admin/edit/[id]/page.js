import { notFound } from 'next/navigation';
import AdminNav from '@/components/AdminNav';
import ArticleEditor from '@/components/ArticleEditor';
import { requireAdmin } from '@/lib/auth';
import { getArticleById, tryDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function EditArticlePage({ params }) {
  const { id } = await params;
  await requireAdmin('/admin/edit/' + id);

  const article = await tryDb(() => getArticleById(Number.parseInt(id, 10)), null);
  if (!article) notFound();

  const serialised = {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    content: article.content,
    cover_image: article.cover_image,
    cover_credit: article.cover_credit,
    category: article.category,
    tags: article.tags,
    author: article.author,
    status: article.status,
    featured: article.featured,
    likes: Number(article.likes),
    views: article.views,
    published_at: new Date(article.published_at).toISOString(),
  };

  return (
    <>
      <AdminNav />
      <div className="shell" style={{ paddingBottom: 70 }}>
        <ArticleEditor article={serialised} />
      </div>
    </>
  );
}
