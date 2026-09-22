import Link from 'next/link';
import { notFound } from 'next/navigation';
import Comments from '@/components/Comments';
import LikeButton from '@/components/LikeButton';
import Newsletter from '@/components/Newsletter';
import ReadingProgress from '@/components/ReadingProgress';
import ShareBar from '@/components/ShareBar';
import ViewCounter from '@/components/ViewCounter';
import { ArticleCard } from '@/components/ArticleCard';
import { getArticleBySlug, getComments, getRelated, tryDb } from '@/lib/db';
import { renderMarkdown } from '@/lib/markdown';
import { categoryHue, formatDate, parseTags, readingTime, siteUrl, toExcerpt } from '@/lib/utils';
import { IconComment, IconEye } from '@/components/Icons';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await tryDb(() => getArticleBySlug(slug), null);
  if (!article) return { title: 'Story not found' };
  const description = article.excerpt || toExcerpt(article.content, 160);
  const images = article.cover_image ? [article.cover_image] : [];
  const tags = parseTags(article.tags);
  return {
    title: article.title,
    description,
    keywords: [article.title, article.author, article.category, 'SHAM', ...tags],
    authors: [{ name: article.author }],
    alternates: { canonical: '/article/' + article.slug },
    openGraph: {
      type: 'article',
      title: article.title,
      description,
      url: '/article/' + article.slug,
      images,
      publishedTime: new Date(article.published_at).toISOString(),
      modifiedTime: new Date(article.updated_at).toISOString(),
      authors: [article.author],
      section: article.category,
      tags,
    },
    twitter: { card: 'summary_large_image', title: article.title, description, images },
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = await tryDb(() => getArticleBySlug(slug), null);
  if (!article) notFound();

  const [comments, related] = await Promise.all([
    tryDb(() => getComments(article.id), []),
    tryDb(() => getRelated(article, 3), []),
  ]);

  const url = siteUrl() + '/article/' + article.slug;
  const hue = categoryHue(article.category);
  const tags = parseTags(article.tags);
  const html = renderMarkdown(article.content);
  const serialisedComments = (comments || []).map((c) => ({
    ...c,
    created_at: new Date(c.created_at).toISOString(),
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt || toExcerpt(article.content, 160),
    image: article.cover_image ? [article.cover_image] : undefined,
    datePublished: new Date(article.published_at).toISOString(),
    dateModified: new Date(article.updated_at).toISOString(),
    author: [{ '@type': 'Person', name: article.author }],
    publisher: {
      '@type': 'Organization',
      name: 'SHAM',
      logo: { '@type': 'ImageObject', url: siteUrl() + '/icon.svg' },
    },
    articleSection: article.category,
    keywords: tags.length > 0 ? tags.join(', ') : undefined,
    mainEntityOfPage: url,
  };

  return (
    <div className="shell" style={{ '--hue': hue }}>
      <ReadingProgress />
      <ViewCounter articleId={article.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="article-head">
        <Link href={'/category/' + article.category.toLowerCase()} className="kicker">
          {article.category}
        </Link>
        <h1>{article.title}</h1>
        {article.excerpt ? <p className="article-standfirst">{article.excerpt}</p> : null}
        <div className="article-byline">
          <span className="byline-avatar" aria-hidden="true">
            {article.author.slice(0, 2).toUpperCase()}
          </span>
          <span className="byline-name">{article.author}</span>
          <span className="meta">
            <span>{formatDate(article.published_at)}</span>
            <span>{readingTime(article.content)} min read</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <IconEye width={14} height={14} aria-hidden="true" /> {article.views}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <IconComment width={14} height={14} aria-hidden="true" /> {article.comment_count}
            </span>
          </span>
        </div>
      </header>

      {article.cover_image ? (
        <figure className="cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={article.cover_image} alt={article.title} />
          {article.cover_credit ? <figcaption>{article.cover_credit}</figcaption> : null}
        </figure>
      ) : null}

      <div className="article-layout">
        <div>
          <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />

          {tags.length > 0 ? (
            <div className="tag-row" style={{ marginTop: 36, maxWidth: 'var(--measure)', marginInline: 'auto' }}>
              {tags.map((tag) => (
                <Link key={tag} href={'/search?q=' + encodeURIComponent(tag)} className="tag">
                  {tag}
                </Link>
              ))}
            </div>
          ) : null}

          <div className="engage">
            <LikeButton articleId={article.id} initialLikes={Number(article.likes)} />
            <a href="#comments" className="button button-quiet">
              <IconComment width={16} height={16} aria-hidden="true" />
              Join the conversation
            </a>
            <div style={{ marginLeft: 'auto' }}>
              <ShareBar url={url} title={article.title} />
            </div>
          </div>

          <Comments articleId={article.id} initialComments={serialisedComments} />
        </div>
      </div>

      {related && related.length > 0 ? (
        <section className="section-block">
          <div className="section-head">
            <h2>Read next</h2>
            <Link href={'/category/' + article.category.toLowerCase()}>
              More {article.category}
            </Link>
          </div>
          <div className="grid-3">
            {related.map((item) => (
              <ArticleCard key={item.id} article={item} />
            ))}
          </div>
        </section>
      ) : null}

      <Newsletter />
    </div>
  );
}
