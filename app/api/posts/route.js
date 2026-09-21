import { NextResponse } from "next/server";
import { listPosts } from "@/lib/posts";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || undefined;
  try {
    const posts = await listPosts({ includeDrafts: false, category });
    return NextResponse.json({ posts });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to load posts." },
      { status: 500 }
    );
  }
}
