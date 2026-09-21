import { NextResponse } from "next/server";
import { getAdminSession } from "./auth";

/**
 * Verifies the admin session inside the route handler itself, rather than
 * relying solely on proxy.js. Returns the session on success, or writes a
 * 401 response and returns null.
 */
export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    return { session: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, response: null };
}
