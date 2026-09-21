import Link from 'next/link';
import { CATEGORIES } from '@/lib/utils';

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer-grid">
          <div>
            <Link href="/" className="wordmark" style={{ fontSize: '2rem' }}>
              SHAM<span className="wordmark-dot" aria-hidden="true" />
            </Link>
            <p style={{ color: 'var(--ink-soft)', maxWidth: '34ch', marginTop: 12 }}>
              Independent reporting on the stories shaping the day, written to be read start to
              finish.
            </p>
          </div>
          <div>
            <h4>Sections</h4>
            <ul>
              {CATEGORIES.map((name) => (
                <li key={name}>
                  <Link href={'/category/' + name.toLowerCase()}>{name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>SHAM</h4>
            <ul>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/search">Search</Link></li>
              <li><a href="/rss.xml">RSS feed</a></li>
              <li><Link href="/admin">Newsroom login</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-note">
          <span>© {new Date().getFullYear()} SHAM. All rights reserved.</span>
          <span>Built to be read.</span>
        </div>
      </div>
    </footer>
  );
}
