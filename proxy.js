import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "sham_admin_session";
const VISITOR_COOKIE_NAME = "sham_visitor";

async function isValidSession(token) {
  if (!token) return false;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const authed = await isValidSession(token);

  const isPublicAdminApi =
    pathname === "/api/admin/login" || pathname === "/api/admin/logout";
  const isAdminApi = pathname.startsWith("/api/admin") && !isPublicAdminApi;
  const isAdminPage =
    pathname.startsWith("/admin") && pathname !== "/admin/login";

  if ((isAdminApi || isAdminPage) && !authed) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/admin/login" && authed) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  const response = NextResponse.next();

  if (!request.cookies.get(VISITOR_COOKIE_NAME)?.value) {
    response.cookies.set(VISITOR_COOKIE_NAME, crypto.randomUUID(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|images).*)",
  ],
};
