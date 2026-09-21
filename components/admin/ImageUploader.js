"use client";

import { useRef, useState } from "react";
import Image from "next/image";

export default function ImageUploader({ value, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  async function uploadFile(file) {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed.");
        return;
      }
      onChange(data.url);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  return (
    <div>
      {value ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-line bg-line">
          <Image src={value} alt="Cover" fill className="object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 rounded-full bg-ink/80 text-paper text-xs px-3 py-1.5 hover:bg-ink transition-colors"
          >
            Remove
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-center transition-colors ${
            dragOver ? "border-accent bg-accent/5" : "border-line hover:border-accent"
          }`}
        >
          <p className="text-sm font-medium">
            {uploading ? "Uploading..." : "Click or drag an image here"}
          </p>
          <p className="text-xs text-muted">JPG, PNG, WebP, GIF or AVIF · up to 8MB</p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(e) => uploadFile(e.target.files?.[0])}
      />
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
