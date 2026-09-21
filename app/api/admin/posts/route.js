import { NextResponse } from "next/server";
import { listPosts, createPost } from "@/lib/posts";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;
  try {
    const posts = await listPosts({ includeDrafts: true });
    return NextResponse.json({ posts });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to load posts." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const { response } = await requireAdmin();
  if (response) return response;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const title = (body.title || "").toString().trim();
  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  try {
    const post = await createPost({
      title,
      excerpt: body.excerpt,
      content: body.content,
      coverImage: body.coverImage,
      category: body.category,
      published: body.published,
    });
    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create post." },
      { status: 500 }
    );
  }
}
