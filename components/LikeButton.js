"use client";

import { useEffect, useState } from "react";

function HeartIcon({ filled }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path
        d="M12 20.2s-7.2-4.4-9.6-9C.9 7.7 2.4 4.5 5.6 4c2-.3 3.8.7 6.4 3 2.6-2.3 4.4-3.3 6.4-3 3.2.5 4.7 3.7 3.2 7.2-2.4 4.6-9.6 9-9.6 9Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LikeButton({ postId, initialLikeCount }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialLikeCount);
  const [pending, setPending] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    fetch(`/api/posts/${postId}/like`)
      .then((res) => res.json())
      .then((data) => setLiked(Boolean(data.liked)))
      .catch(() => {});
  }, [postId]);

  async function toggleLike() {
    if (pending) return;
    setPending(true);
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => c + (nextLiked ? 1 : -1));
    if (nextLiked) {
      setPulse(true);
      setTimeout(() => setPulse(false), 300);
    }
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setLiked(data.liked);
        setCount(data.likeCount);
      } else {
        setLiked(!nextLiked);
        setCount((c) => c - (nextLiked ? 1 : -1));
      }
    } catch {
      setLiked(!nextLiked);
      setCount((c) => c - (nextLiked ? 1 : -1));
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleLike}
      aria-pressed={liked}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        liked
          ? "border-danger bg-danger/10 text-danger"
          : "border-line text-ink hover:border-danger hover:text-danger"
      }`}
    >
      <span className={pulse ? "scale-125 transition-transform" : "transition-transform"}>
        <HeartIcon filled={liked} />
      </span>
      {count} {count === 1 ? "like" : "likes"}
    </button>
  );
}
