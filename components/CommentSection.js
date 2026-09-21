"use client";

import { useState } from "react";

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [name, secs] of units) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value} ${name}${value > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

export default function CommentSection({ postId, initialComments }) {
  const [comments, setComments] = useState(initialComments);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !body.trim()) {
      setError("Please add your name and a comment.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, body }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setComments((prev) => [data.comment, ...prev]);
      setBody("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-4">
      <h2 className="font-display text-2xl font-semibold">
        {comments.length === 0
          ? "Be the first to comment"
          : `${comments.length} comment${comments.length === 1 ? "" : "s"}`}
      </h2>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            className="rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm focus:border-accent outline-none"
          />
        </div>
        <textarea
          placeholder="Share your thoughts..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          maxLength={2000}
          className="w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm focus:border-accent outline-none resize-y"
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-ink text-paper px-5 py-2.5 text-sm font-medium hover:bg-accent-ink transition-colors disabled:opacity-50"
        >
          {submitting ? "Posting..." : "Post comment"}
        </button>
      </form>

      <ul className="mt-10 space-y-6">
        {comments.map((c) => (
          <li key={c.id} className="border-t border-line pt-5">
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-full bg-accent/10 text-accent-ink flex items-center justify-center font-display font-semibold text-sm">
                {c.name.slice(0, 1).toUpperCase()}
              </span>
              <div>
                <p className="text-sm font-medium text-ink">{c.name}</p>
                <p className="text-xs text-muted">{timeAgo(c.createdAt)}</p>
              </div>
            </div>
            <p className="mt-3 text-[15px] leading-relaxed text-ink whitespace-pre-wrap">
              {c.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
