import Link from "next/link";
import Image from "next/image";
import { listPosts } from "@/lib/posts";
import { formatDate, estimateReadTime, pluralize } from "@/lib/format";
import PostCard from "@/components/PostCard";

export const revalidate = 0;

export default async function HomePage() {
  const posts = await listPosts();

  if (posts.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-24 text-center">
        <h1 className="font-display text-4xl font-semibold">
          Nothing published yet
        </h1>
        <p className="mt-3 text-muted max-w-md mx-auto">
          Once you publish your first story from the admin dashboard, it will
          appear here.
        </p>
        <Link
          href="/admin"
          className="mt-6 inline-block rounded-full bg-ink text-paper px-5 py-2.5 text-sm font-medium hover:bg-accent-ink transition-colors"
        >
          Go to admin
        </Link>
      </div>
    );
  }

  const [featured, ...rest] = posts;
  const latest = rest.slice(0, 4);
  const grid = rest.slice(4);

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10">
      <section className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <Link href={`/post/${featured.slug}`} className="block group">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-line">
              {featured.coverImage ? (
                <Image
                  src={featured.coverImage}
                  alt={featured.title}
                  fill
                  priority
                  sizes="(min-width: 1024px) 66vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center font-display text-6xl text-muted">
                  {featured.title.slice(0, 1)}
                </div>
              )}
            </div>
          </Link>
          <span className="mt-5 inline-block rounded-full bg-amber/25 text-amber-ink text-xs font-medium px-2.5 py-1">
            {featured.category}
          </span>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl font-bold leading-tight">
            <Link
              href={`/post/${featured.slug}`}
              className="hover:text-accent-ink transition-colors"
            >
              {featured.title}
            </Link>
          </h1>
          <p className="mt-3 text-muted text-lg leading-relaxed max-w-2xl">
            {featured.excerpt}
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted">
            <span>{formatDate(featured.createdAt)}</span>
            <span aria-hidden="true">·</span>
            <span>{estimateReadTime(featured.content)}</span>
            <span aria-hidden="true">·</span>
            <span>
              {featured.likeCount} {pluralize(featured.likeCount, "like")}
            </span>
          </div>
        </div>

        <aside id="latest" className="lg:border-l lg:border-line lg:pl-8">
          <h2 className="font-display text-xl font-semibold">Latest</h2>
          <ul className="mt-4 divide-y divide-line">
            {latest.length === 0 && (
              <li className="py-4 text-sm text-muted">
                More stories are on the way.
              </li>
            )}
            {latest.map((post) => (
              <li key={post.id} className="py-4 first:pt-0">
                <Link href={`/post/${post.slug}`} className="group block">
                  <p className="text-xs text-muted">{post.category}</p>
                  <h3 className="mt-1 font-display text-base font-semibold leading-snug group-hover:text-accent-ink transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted">
                    {formatDate(post.createdAt)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      {grid.length > 0 && (
        <section className="mt-16 border-t border-line pt-12">
          <h2 className="font-display text-2xl font-semibold">
            More stories
          </h2>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {grid.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
