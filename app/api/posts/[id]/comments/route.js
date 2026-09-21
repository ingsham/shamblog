import { NextResponse } from "next/server";
import { getPostById } from "@/lib/posts";
import { listCommentsForPost, createComment } from "@/lib/comments";

export async function GET(request, { params }) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId)) {
    return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
  }
  try {
    const comments = await listCommentsForPost(postId);
    return NextResponse.json({ comments });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to load comments." },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId)) {
    return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = (body.name || "").toString().trim().slice(0, 80);
  const text = (body.body || "").toString().trim().slice(0, 2000);

  if (!name) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!text) {
    return NextResponse.json({ error: "Comment cannot be empty." }, { status: 400 });
  }

  try {
    const post = await getPostById(postId);
    if (!post || !post.published) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const comment = await createComment(postId, { name, body: text });
    return NextResponse.json({ comment }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to post comment." },
      { status: 500 }
    );
  }
}
