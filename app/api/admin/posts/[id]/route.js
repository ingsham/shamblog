import { NextResponse } from "next/server";
import { getPostById, updatePost, deletePost } from "@/lib/posts";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET(request, { params }) {
  const { response } = await requireAdmin();
  if (response) return response;
  const { id } = await params;
  const post = await getPostById(Number(id));
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ post });
}

export async function PUT(request, { params }) {
  const { response } = await requireAdmin();
  if (response) return response;
  const { id } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const post = await updatePost(Number(id), {
      title: body.title,
      excerpt: body.excerpt,
      content: body.content,
      coverImage: body.coverImage,
      category: body.category,
      published: body.published,
      regenerateSlug: body.regenerateSlug,
    });
    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ post });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update post." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const { response } = await requireAdmin();
  if (response) return response;
  const { id } = await params;
  try {
    await deletePost(Number(id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to delete post." },
      { status: 500 }
    );
  }
}
