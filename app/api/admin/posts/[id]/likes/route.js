import { NextResponse } from "next/server";
import { setLikeOverride } from "@/lib/posts";
import { clearLikes } from "@/lib/likes";
import { requireAdmin } from "@/lib/requireAdmin";

export async function PUT(request, { params }) {
  const { response } = await requireAdmin();
  if (response) return response;
  const { id } = await params;
  const postId = Number(id);
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    if (body.action === "reset") {
      // Clear manual override AND wipe real like rows -> back to zero.
      await clearLikes(postId);
      const post = await setLikeOverride(postId, null);
      return NextResponse.json({ post });
    }

    if (body.action === "clearOverride") {
      const post = await setLikeOverride(postId, null);
      return NextResponse.json({ post });
    }

    const value = Number(body.count);
    if (!Number.isFinite(value) || value < 0) {
      return NextResponse.json(
        { error: "count must be a non-negative number." },
        { status: 400 }
      );
    }
    const post = await setLikeOverride(postId, Math.round(value));
    return NextResponse.json({ post });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update likes." },
      { status: 500 }
    );
  }
}
