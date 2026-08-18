import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/session";
import { renderShippingLabels } from "@/lib/admin/documents";

export const runtime = "nodejs";

const bodySchema = z.object({
  orderNumbers: z.array(z.string().min(1)).min(1).max(100),
});

async function pdfResponse(orderNumbers: string[], actorEmail: string) {
  const { buffer, filename } = await renderShippingLabels(orderNumbers, actorEmail);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

export async function GET(request: Request) {
  const session = await requireAdminSession();
  if (!session.ok) return session.response;
  const orderNumber = new URL(request.url).searchParams.get("orderNumber");
  if (!orderNumber) {
    return NextResponse.json({ error: "Select at least one order." }, { status: 400 });
  }
  try {
    return await pdfResponse([orderNumber], session.email);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not render labels." },
      { status: 400 },
    );
  }
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session.ok) return session.response;
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Select at least one order." }, { status: 400 });
  }
  try {
    return await pdfResponse(parsed.data.orderNumbers, session.email);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not render labels." },
      { status: 400 },
    );
  }
}
