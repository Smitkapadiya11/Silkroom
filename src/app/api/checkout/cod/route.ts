import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    { error: "Please pay securely online with UPI, card, or netbanking." },
    { status: 410 },
  );
}
