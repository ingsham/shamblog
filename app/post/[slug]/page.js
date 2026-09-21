import Image from "next/image";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPostBySlug } from "@/lib/posts";
import { listCommentsForPost } from "@/lib/comments";
import { formatDate, estimateReadTime } from "@/lib/format";
import LikeButton from "@/components/LikeButton";
import ShareButtons from "@/components/ShareButtons";
import CommentSection from "@/components/CommentSection";

export const revalidate = 0;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : [],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function PostPage({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const comments = await listCommentsForPost(post.id);
  const url = `${siteUrl}/post/${post.slug}`;

  return (
    <article className="mx-auto max-w-3xl px-5 sm:px-8 py-10">
      <span className="inline-block rounded-full bg-amber/25 text-amber-ink text-xs font-medium px-2.5 py-1">
        {post.category}
      </span>
      <h1 className="mt-4 font-display text-3xl sm:text-5xl font-bold leading-tight">
        {post.title}
      </h1>
      <p className="mt-4 text-lg text-muted leading-relaxed">
        {post.excerpt}
      </p>
      <div className="mt-5 flex items-center gap-2 text-sm text-muted">
        <span>{formatDate(post.createdAt)}</span>
        <span aria-hidden="true">·</span>
        <span>{estimateReadTime(post.content)}</span>
      </div>

      {post.coverImage && (
        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-lg bg-line">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-line py-4">
        <LikeButton postId={post.id} initialLikeCount={post.likeCount} />
        <ShareButtons url={url} title={post.title} />
      </div>

      <div className="prose-article mt-10">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content}
        </ReactMarkdown>
      </div>

      <div className="mt-10 flex items-center justify-between gap-4 border-t border-line pt-6">
        <LikeButton postId={post.id} initialLikeCount={post.likeCount} />
        <ShareButtons url={url} title={post.title} />
      </div>

      <div className="mt-14 border-t border-line pt-10">
        <CommentSection postId={post.id} initialComments={comments} />
      </div>
    </article>
  );
}
