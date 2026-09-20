'use client';

import { useEffect, useState } from 'react';
import { IconHeart } from '@/components/Icons';

export default function LikeButton({ articleId, initialLikes }) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [burst, setBurst] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/likes?articleId=' + articleId)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data) {
          setLikes(data.likes);
          setLiked(Boolean(data.liked));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [articleId]);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const next = !liked;
    setLiked(next);
    setLikes((n) => n + (next ? 1 : -1));
    if (next) setBurst((n) => n + 1);
    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId }),
      });
      const data = await res.json();
      if (res.ok) {
        setLikes(data.likes);
        setLiked(Boolean(data.liked));
      }
    } catch (err) {
      setLiked(!next);
      setLikes((n) => n + (next ? -1 : 1));
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className="like-button"
      data-liked={liked}
      onClick={toggle}
      aria-pressed={liked}
      aria-label={liked ? 'Remove your like' : 'Like this article'}
    >
      {burst > 0 ? <span key={burst} className="like-burst" aria-hidden="true" /> : null}
      <IconHeart filled={liked} aria-hidden="true" />
      <span>{likes}</span>
    </button>
  );
}
