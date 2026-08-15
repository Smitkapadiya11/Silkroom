import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");
  const isLogin = pathname === "/admin/login";
  const isLoginApi = pathname === "/api/admin/login";
  const isAuthRoute = pathname.startsWith("/api/auth");

  if (!isAdminPage && !isAdminApi && !isAuthRoute) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  if (isAdminPage || isAdminApi) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  // All credential logins must pass through /api/admin/login, which applies
  // the Upstash/DB rate limit before calling Auth.js server-side.
  if (
    pathname === "/api/auth/callback/credentials" &&
    request.method === "POST"
  ) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  if (isLogin || isLoginApi || isAuthRoute) {
    return response;
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });
  const adminUsername =
    process.env.ADMIN_USERNAME?.trim().toLowerCase() ??
    process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const email = typeof token?.email === "string" ? token.email.toLowerCase() : "";
  const authed = Boolean(email && adminUsername && email === adminUsername);

  if (!authed) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/auth/:path*"],
};
