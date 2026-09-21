"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/format";

export default function AdminCommentsPage() {
  const [comments, setComments] = useState(null);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [busyId, setBusyId] = useState(null);

  async function load() {
    try {
      const res = await fetch("/api/admin/comments");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setComments(data.comments);
    } catch (err) {
      setError(err.message || "Failed to load comments.");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  function startEdit(comment) {
    setEditingId(comment.id);
    setEditValue(comment.body);
  }

  async function saveEdit(comment) {
    setBusyId(comment.id);
    try {
      await fetch(`/api/admin/comments/${comment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: editValue }),
      });
      setEditingId(null);
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function deleteComment(comment) {
    if (!confirm("Delete this comment?")) return;
    setBusyId(comment.id);
    try {
      await fetch(`/api/admin/comments/${comment.id}`, { method: "DELETE" });
      await load();
    } finally {
      setBusyId(null);
    }
  }

  if (error) return <p className="text-sm text-danger">{error}</p>;
  if (!comments) return <p className="text-sm text-muted">Loading comments...</p>;

  if (comments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line p-10 text-center">
        <p className="font-display text-xl font-semibold">No comments yet</p>
        <p className="mt-2 text-sm text-muted">
          Reader comments will show up here once your articles start getting
          attention.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {comments.map((c) => (
        <li key={c.id} className="rounded-lg border border-line p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium">{c.name}</p>
              <p className="text-xs text-muted mt-0.5">
                on{" "}
                <Link
                  href={`/post/${c.postSlug}`}
                  className="hover:text-accent-ink underline"
                  target="_blank"
                >
                  {c.postTitle}
                </Link>{" "}
                · {formatDate(c.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => startEdit(c)}
                className="text-xs text-accent-ink hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => deleteComment(c)}
                disabled={busyId === c.id}
                className="text-xs text-danger hover:underline disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>

          {editingId === c.id ? (
            <div className="mt-3">
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-accent outline-none"
              />
              <div className="mt-2 flex gap-3">
                <button
                  onClick={() => saveEdit(c)}
                  disabled={busyId === c.id}
                  className="text-xs font-medium text-accent-ink hover:underline"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-xs text-muted hover:underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm whitespace-pre-wrap">{c.body}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
