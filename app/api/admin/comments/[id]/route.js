import { NextResponse } from "next/server";
import { updateComment, deleteComment } from "@/lib/comments";
import { requireAdmin } from "@/lib/requireAdmin";

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
    const comment = await updateComment(Number(id), {
      body: body.body,
      approved: body.approved,
    });
    if (!comment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ comment });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update comment." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const { response } = await requireAdmin();
  if (response) return response;
  const { id } = await params;
  try {
    await deleteComment(Number(id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to delete comment." },
      { status: 500 }
    );
  }
}
