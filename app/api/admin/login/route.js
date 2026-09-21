import { NextResponse } from "next/server";
import {
  verifyAdminCredentials,
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = (body.email || "").toString();
  const password = (body.password || "").toString();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  let valid;
  try {
    valid = verifyAdminCredentials(email, password);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Admin login is not configured on the server." },
      { status: 500 }
    );
  }

  if (!valid) {
    return NextResponse.json(
      { error: "Incorrect email or password." },
      { status: 401 }
    );
  }

  const token = await createSessionToken(email);
  await setSessionCookie(token);

  return NextResponse.json({ ok: true });
}
