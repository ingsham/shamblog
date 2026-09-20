'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchForm({ initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  function submit(event) {
    event.preventDefault();
    const term = query.trim();
    router.push(term ? '/search?q=' + encodeURIComponent(term) : '/search');
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: 8 }} role="search">
      <input
        className="input"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search headlines, tags and text"
        aria-label="Search articles"
        autoFocus
      />
      <button type="submit" className="button">Search</button>
    </form>
  );
}
