import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { listArticles, tryDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function SiteLayout({ children }) {
  const headlines = (await tryDb(() => listArticles({ limit: 4 }), [])) || [];

  return (
    <>
      <a className="skip-link" href="#main">Skip to the story</a>
      {headlines.length > 0 ? (
        <div className="ticker">
          <div className="shell ticker-row">
            <span className="ticker-label">Latest</span>
            {headlines.map((item, i) => (
              <Link
                key={item.id}
                href={'/article/' + item.slug}
                className={i === 0 ? undefined : 'hide-mobile'}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
