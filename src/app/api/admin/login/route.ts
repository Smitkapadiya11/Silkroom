import { NextResponse } from "next/server";

// Credentials are intentionally handled by Auth.js at /api/auth/callback/credentials.
// Keeping this route prevents stale clients from using the deprecated custom login path.
export async function POST() {
  return NextResponse.json({ error: "Not found." }, { status: 404 });
}
