"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/format";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [likeEditId, setLikeEditId] = useState(null);
  const [likeValue, setLikeValue] = useState("");

  async function load() {
    try {
      const res = await fetch("/api/admin/posts");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPosts(data.posts);
    } catch (err) {
      setError(err.message || "Failed to load posts.");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function togglePublish(post) {
    setBusyId(post.id);
    try {
      await fetch(`/api/admin/posts/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !post.published }),
      });
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function deletePost(post) {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    setBusyId(post.id);
    try {
      await fetch(`/api/admin/posts/${post.id}`, { method: "DELETE" });
      await load();
    } finally {
      setBusyId(null);
    }
  }

  function startEditLikes(post) {
    setLikeEditId(post.id);
    setLikeValue(String(post.likeCount));
  }

  async function saveLikes(post) {
    setBusyId(post.id);
    try {
      await fetch(`/api/admin/posts/${post.id}/likes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: Number(likeValue) }),
      });
      setLikeEditId(null);
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function resetLikes(post) {
    if (!confirm(`Reset all likes for "${post.title}" to 0?`)) return;
    setBusyId(post.id);
    try {
      await fetch(`/api/admin/posts/${post.id}/likes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      setLikeEditId(null);
      await load();
    } finally {
      setBusyId(null);
    }
  }

  if (error) {
    return <p className="text-sm text-danger">{error}</p>;
  }

  if (!posts) {
    return <p className="text-sm text-muted">Loading posts...</p>;
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line p-10 text-center">
        <p className="font-display text-xl font-semibold">No posts yet</p>
        <p className="mt-2 text-sm text-muted">
          Write your first story to get SHAM started.
        </p>
        <Link
          href="/admin/posts/new"
          className="mt-5 inline-block rounded-full bg-ink text-paper px-5 py-2.5 text-sm font-medium hover:bg-accent-ink transition-colors"
        >
          New post
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-muted border-b border-line">
            <th className="py-2.5 pr-4 font-medium">Title</th>
            <th className="py-2.5 pr-4 font-medium">Status</th>
            <th className="py-2.5 pr-4 font-medium">Likes</th>
            <th className="py-2.5 pr-4 font-medium">Comments</th>
            <th className="py-2.5 pr-4 font-medium">Date</th>
            <th className="py-2.5 pr-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id} className="border-b border-line align-top">
              <td className="py-3 pr-4 max-w-xs">
                <Link
                  href={`/admin/posts/${post.id}/edit`}
                  className="font-medium hover:text-accent-ink transition-colors"
                >
                  {post.title}
                </Link>
                <p className="text-xs text-muted mt-0.5">{post.category}</p>
              </td>
              <td className="py-3 pr-4">
                <span
                  className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                    post.published
                      ? "bg-accent/10 text-accent-ink"
                      : "bg-line text-muted"
                  }`}
                >
                  {post.published ? "Published" : "Draft"}
                </span>
              </td>
              <td className="py-3 pr-4">
                {likeEditId === post.id ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      value={likeValue}
                      onChange={(e) => setLikeValue(e.target.value)}
                      className="w-16 rounded-md border border-line px-2 py-1 text-sm"
                    />
                    <button
                      onClick={() => saveLikes(post)}
                      className="text-accent-ink text-xs font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setLikeEditId(null)}
                      className="text-muted text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{post.likeCount}</span>
                    <button
                      onClick={() => startEditLikes(post)}
                      className="text-xs text-accent-ink hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => resetLikes(post)}
                      className="text-xs text-muted hover:text-danger hover:underline"
                    >
                      Reset
                    </button>
                  </div>
                )}
              </td>
              <td className="py-3 pr-4">{post.commentCount}</td>
              <td className="py-3 pr-4 text-muted">
                {formatDate(post.createdAt)}
              </td>
              <td className="py-3 pr-4">
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => togglePublish(post)}
                    disabled={busyId === post.id}
                    className="text-xs text-accent-ink hover:underline disabled:opacity-50"
                  >
                    {post.published ? "Unpublish" : "Publish"}
                  </button>
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="text-xs text-ink hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => deletePost(post)}
                    disabled={busyId === post.id}
                    className="text-xs text-danger hover:underline disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
