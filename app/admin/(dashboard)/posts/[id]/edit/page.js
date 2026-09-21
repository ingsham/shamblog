import { notFound } from "next/navigation";
import { getPostById } from "@/lib/posts";
import PostForm from "@/components/admin/PostForm";

export const metadata = { title: "Edit post" };

export default async function EditPostPage({ params }) {
  const { id } = await params;
  const post = await getPostById(Number(id));
  if (!post) notFound();

  return (
    <div>
      <h2 className="font-display text-xl font-semibold mb-6">Edit post</h2>
      <PostForm initialPost={post} postId={post.id} />
    </div>
  );
}
