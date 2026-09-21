import PostForm from "@/components/admin/PostForm";

export const metadata = { title: "New post" };

export default function NewPostPage() {
  return (
    <div>
      <h2 className="font-display text-xl font-semibold mb-6">New post</h2>
      <PostForm />
    </div>
  );
}
