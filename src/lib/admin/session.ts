import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function requireAdminSession() {
  const session = await auth();
  const username = session?.user?.email?.toLowerCase();
  const adminUsername =
    process.env.ADMIN_USERNAME?.trim().toLowerCase() ??
    process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!username || !adminUsername || username !== adminUsername) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
    };
  }
  return { ok: true as const, email: username, session };
}

export function clientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
