'use client';

import { useEffect } from 'react';

// Counts one view per article per browser session so a refresh does not inflate it.
export default function ViewCounter({ articleId }) {
  useEffect(() => {
    const key = 'sham-viewed-' + articleId;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch (err) {
      /* storage may be blocked; counting once per load is fine */
    }
    fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleId }),
      keepalive: true,
    }).catch(() => {});
  }, [articleId]);

  return null;
}
