'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/new', label: 'Write' },
  { href: '/admin/comments', label: 'Comments' },
  { href: '/admin/subscribers', label: 'Subscribers' },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div className="admin-bar">
      <div className="shell admin-bar-row">
        <Link href="/admin" className="wordmark" style={{ fontSize: '1.3rem' }}>
          SHAM<span className="wordmark-dot" aria-hidden="true" />
        </Link>
        <nav>
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} data-active={pathname === link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <Link href="/" className="button button-quiet button-small" target="_blank">
            View site
          </Link>
          <button type="button" className="button button-quiet button-small" onClick={signOut}>
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
