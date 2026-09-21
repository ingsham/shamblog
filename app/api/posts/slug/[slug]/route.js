import { NextResponse } from "next/server";
import { getPostBySlug } from "@/lib/posts";

export async function GET(request, { params }) {
  const { slug } = await params;
  try {
    const post = await getPostBySlug(slug, { includeDrafts: false });
    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ post });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to load post." },
      { status: 500 }
    );
  }
}
