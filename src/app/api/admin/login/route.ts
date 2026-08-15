import { AuthError } from "next-auth";
import { NextResponse } from "next/server";
import { signIn } from "@/auth";
import { clientIp } from "@/lib/admin/session";
import { getLoginRateLimiter } from "@/lib/admin/rate-limit";

export const runtime = "nodejs";

function safeAdminCallbackUrl(callbackUrl: unknown, request: Request) {
  if (typeof callbackUrl !== "string") return "/admin";
  if (!callbackUrl.startsWith("/") || callbackUrl.startsWith("//") || callbackUrl.includes("\\")) {
    return "/admin";
  }
  try {
    const resolved = new URL(callbackUrl, request.url);
    const origin = new URL(request.url).origin;
    if (resolved.origin !== origin) return "/admin";
    if (!resolved.pathname.startsWith("/admin")) return "/admin";
    return `${resolved.pathname}${resolved.search}`;
  } catch {
    return "/admin";
  }
}

export async function POST(request: Request) {
  const limiter = getLoginRateLimiter();
  if (limiter) {
    const result = await limiter.limit(clientIp(request));
    if (!result.success) {
      return NextResponse.json({ error: "Unable to sign in." }, { status: 429 });
    }
  } else {
    console.warn("Admin login rate limiting unavailable: Upstash is not configured.");
  }

  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password) {
      return NextResponse.json({ error: "Unable to sign in." }, { status: 401 });
    }

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return NextResponse.json({ url: safeAdminCallbackUrl(body.callbackUrl, request) });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: "Unable to sign in." }, { status: 401 });
    }
    // Successful Auth.js redirects throw NEXT_REDIRECT in some versions.
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
    ) {
      return NextResponse.json({ url: "/admin" });
    }
    return NextResponse.json({ error: "Unable to sign in." }, { status: 401 });
  }
}
