import { cookies } from "next/headers";

export const VISITOR_COOKIE_NAME = "sham_visitor";

export async function getVisitorId() {
  const store = await cookies();
  return store.get(VISITOR_COOKIE_NAME)?.value || null;
}
