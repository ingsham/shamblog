import { NextResponse } from "next/server";
import { getPostById } from "@/lib/posts";
import { hasLiked, addLike, removeLike } from "@/lib/likes";
import { getVisitorId } from "@/lib/visitor";

export async function POST(request, { params }) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId)) {
    return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
  }

  const visitorId = await getVisitorId();
  if (!visitorId) {
    return NextResponse.json(
      { error: "Could not identify visitor. Please reload and try again." },
      { status: 400 }
    );
  }

  try {
    const post = await getPostById(postId);
    if (!post || !post.published) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const alreadyLiked = await hasLiked(postId, visitorId);
    if (alreadyLiked) {
      await removeLike(postId, visitorId);
    } else {
      await addLike(postId, visitorId);
    }

    const updated = await getPostById(postId);
    return NextResponse.json({
      liked: !alreadyLiked,
      likeCount: updated.likeCount,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update like." },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  const { id } = await params;
  const postId = Number(id);
  const visitorId = await getVisitorId();
  if (!Number.isInteger(postId) || !visitorId) {
    return NextResponse.json({ liked: false });
  }
  const liked = await hasLiked(postId, visitorId);
  return NextResponse.json({ liked });
}
