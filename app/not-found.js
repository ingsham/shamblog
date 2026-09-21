import Link from 'next/link';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <div className="shell" style={{ padding: '120px 20px', textAlign: 'center' }}>
      <p className="kicker" style={{ justifyContent: 'center' }}>404</p>
      <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.4rem)', margin: '16px 0 12px', letterSpacing: '-0.045em' }}>
        That page has moved on
      </h1>
      <p style={{ color: 'var(--ink-soft)', maxWidth: '44ch', margin: '0 auto 26px' }}>
        The link may be out of date, or the story may have been unpublished. The front page has the
        latest.
      </p>
      <Link href="/" className="button">Go to the front page</Link>
    </div>
  );
}
