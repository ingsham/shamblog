"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ImageUploader from "@/components/admin/ImageUploader";

const CATEGORIES = [
  "General",
  "Culture",
  "Politics",
  "Technology",
  "Business",
  "Opinion",
  "World",
];

export default function PostForm({ initialPost, postId }) {
  const router = useRouter();
  const isEdit = Boolean(postId);

  const [title, setTitle] = useState(initialPost?.title || "");
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || "");
  const [content, setContent] = useState(initialPost?.content || "");
  const [coverImage, setCoverImage] = useState(initialPost?.coverImage || "");
  const [category, setCategory] = useState(initialPost?.category || "General");
  const [published, setPublished] = useState(
    initialPost?.published !== undefined ? initialPost.published : true
  );
  const [tab, setTab] = useState("write");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("Please give the article a title.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title,
        excerpt,
        content,
        coverImage: coverImage || null,
        category,
        published,
      };
      const res = await fetch(
        isEdit ? `/api/admin/posts/${postId}` : "/api/admin/posts",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save post.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Failed to save post. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div>
        <label className="block text-sm font-medium mb-1.5">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="A headline readers can't scroll past"
          className="w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm focus:border-accent outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Excerpt</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          placeholder="One or two sentences shown on the homepage and in shares"
          className="w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm focus:border-accent outline-none resize-y"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm focus:border-accent outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Status</label>
          <select
            value={published ? "published" : "draft"}
            onChange={(e) => setPublished(e.target.value === "published")}
            className="w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm focus:border-accent outline-none"
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">
          Cover image
        </label>
        <ImageUploader value={coverImage} onChange={setCoverImage} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium">
            Content (Markdown supported)
          </label>
          <div className="flex rounded-md border border-line text-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setTab("write")}
              className={`px-3 py-1.5 ${tab === "write" ? "bg-ink text-paper" : ""}`}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setTab("preview")}
              className={`px-3 py-1.5 ${tab === "preview" ? "bg-ink text-paper" : ""}`}
            >
              Preview
            </button>
          </div>
        </div>
        {tab === "write" ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
            placeholder="Write the article in Markdown. ## for headings, > for quotes, ![alt](url) for images..."
            className="w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm focus:border-accent outline-none resize-y font-mono"
          />
        ) : (
          <div className="prose-article rounded-md border border-line px-4 py-3 min-h-[300px]">
            {content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            ) : (
              <p className="text-muted text-sm">Nothing to preview yet.</p>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-ink text-paper px-5 py-2.5 text-sm font-medium hover:bg-accent-ink transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : isEdit ? "Save changes" : "Publish article"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="text-sm text-muted hover:text-ink transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
