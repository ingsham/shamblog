'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CATEGORIES } from '@/lib/utils';
import { IconSearch, IconSun, IconMoon } from '@/components/Icons';

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('sham-theme') : null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(stored || (prefersDark ? 'dark' : 'light'));
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('sham-theme', next);
    } catch (err) {
      /* storage may be blocked; the toggle still works for this visit */
    }
  }

  function submitSearch(event) {
    event.preventDefault();
    const term = query.trim();
    if (term) router.push('/search?q=' + encodeURIComponent(term));
  }

  return (
    <header className="masthead">
      <div className="shell masthead-row">
        <Link href="/" className="wordmark" aria-label="SHAM, home">
          SHAM<span className="wordmark-dot" aria-hidden="true" />
        </Link>

        <nav className="masthead-nav" aria-label="Sections">
          {CATEGORIES.map((name) => {
            const href = '/category/' + name.toLowerCase();
            return (
              <Link key={name} href={href} data-active={pathname === href}>
                {name}
              </Link>
            );
          })}
        </nav>

        <div className="masthead-tools">
          <form className="search-field" onSubmit={submitSearch} role="search">
            <IconSearch width={15} height={15} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search SHAM"
              aria-label="Search articles"
            />
          </form>
          <Link href="/search" className="icon-button search-link" aria-label="Search">
            <IconSearch aria-hidden="true" />
          </Link>
          <button
            type="button"
            className="icon-button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? <IconSun aria-hidden="true" /> : <IconMoon aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  );
}
