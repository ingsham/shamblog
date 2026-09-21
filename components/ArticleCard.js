import Link from 'next/link';
import { categoryHue, formatDate, readingTime } from '@/lib/utils';
import { IconComment, IconHeart } from '@/components/Icons';

// Articles without a cover still need to read as part of their section, so the
// placeholder is a wash of that section's hue rather than a grey box.
function CoverInner({ article }) {
  if (!article.cover_image) {
    return (
      <div
        aria-hidden="true"
        style={{
          width: '100%',
          height: '100%',
          background:
            'linear-gradient(140deg, color-mix(in srgb, ' +
            categoryHue(article.category) +
            ' 26%, var(--paper-deep)) 0%, var(--paper-deep) 70%)',
        }}
      />
    );
  }
  /* eslint-disable-next-line @next/next/no-img-element */
  return <img src={article.cover_image} alt="" loading="lazy" decoding="async" />;
}

export function LeadArticle({ article }) {
  return (
    <article className="lead" style={{ '--hue': categoryHue(article.category) }}>
      <div>
        <Link href={'/category/' + article.category.toLowerCase()} className="kicker">
          {article.category}
        </Link>
        <h1>
          <Link href={'/article/' + article.slug}>{article.title}</Link>
        </h1>
        {article.excerpt ? <p className="lead-standfirst">{article.excerpt}</p> : null}
        <div className="meta" style={{ marginTop: 22 }}>
          <span>{article.author}</span>
          <span>{formatDate(article.published_at)}</span>
          <span>{readingTime(article.content)} min read</span>
        </div>
      </div>
      <Link href={'/article/' + article.slug} className="lead-media" tabIndex={-1} aria-hidden="true">
        <CoverInner article={article} />
      </Link>
    </article>
  );
}

export function ArticleCard({ article }) {
  return (
    <article className="card" style={{ '--hue': categoryHue(article.category) }}>
      <Link href={'/article/' + article.slug} className="card-media" tabIndex={-1} aria-hidden="true">
        <CoverInner article={article} />
      </Link>
      <Link href={'/category/' + article.category.toLowerCase()} className="kicker">
        {article.category}
      </Link>
      <h3>
        <Link href={'/article/' + article.slug}>{article.title}</Link>
      </h3>
      {article.excerpt ? <p>{article.excerpt}</p> : null}
      <div className="meta">
        <span>{formatDate(article.published_at)}</span>
        <span>{readingTime(article.content)} min</span>
      </div>
    </article>
  );
}

export function RiverItem({ article, index }) {
  return (
    <article className="river-item" style={{ '--hue': categoryHue(article.category) }}>
      <div className="river-index">{String(index).padStart(2, '0')}</div>
      <div>
        <Link href={'/category/' + article.category.toLowerCase()} className="kicker">
          {article.category}
        </Link>
        <h3>
          <Link href={'/article/' + article.slug}>{article.title}</Link>
        </h3>
        {article.excerpt ? <p>{article.excerpt}</p> : null}
        <div className="meta">
          <span>{article.author}</span>
          <span>{formatDate(article.published_at)}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <IconHeart width={13} height={13} aria-hidden="true" /> {article.likes}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <IconComment width={13} height={13} aria-hidden="true" /> {article.comment_count}
          </span>
        </div>
      </div>
      <Link href={'/article/' + article.slug} className="river-media" tabIndex={-1} aria-hidden="true">
        <CoverInner article={article} />
      </Link>
    </article>
  );
}
