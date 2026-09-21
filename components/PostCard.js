import Link from "next/link";
import Image from "next/image";
import { formatDate, estimateReadTime, pluralize } from "@/lib/format";

export default function PostCard({ post, priority = false }) {
  return (
    <article className="group">
      <Link href={`/post/${post.slug}`} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-line">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center font-display text-4xl text-muted">
              {post.title.slice(0, 1)}
            </div>
          )}
        </div>
      </Link>
      <div className="mt-4">
        <span className="inline-block rounded-full bg-amber/25 text-amber-ink text-xs font-medium px-2.5 py-1">
          {post.category}
        </span>
        <h3 className="mt-3 font-display text-xl font-semibold leading-snug">
          <Link
            href={`/post/${post.slug}`}
            className="hover:text-accent-ink transition-colors"
          >
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 text-sm text-muted line-clamp-2">{post.excerpt}</p>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted">
          <span>{formatDate(post.createdAt)}</span>
          <span aria-hidden="true">·</span>
          <span>{estimateReadTime(post.content)}</span>
          <span aria-hidden="true">·</span>
          <span>
            {post.likeCount} {pluralize(post.likeCount, "like")}
          </span>
        </div>
      </div>
    </article>
  );
}
