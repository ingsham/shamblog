import { NextResponse } from "next/server";
import { listAllComments } from "@/lib/comments";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;
  try {
    const comments = await listAllComments();
    return NextResponse.json({ comments });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to load comments." },
      { status: 500 }
    );
  }
}
