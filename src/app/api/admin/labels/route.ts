import { NextResponse } from "next/server";
import { z } from "zod";
import { clientIp, requireAdminSession } from "@/lib/admin/session";
import { renderShippingLabels } from "@/lib/admin/documents";

export const runtime = "nodejs";

const bodySchema = z.object({
  orderNumbers: z.array(z.string().min(1)).min(1).max(100),
});

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session.ok) return session.response;

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Select at least one order." }, { status: 400 });
  }

  try {
    const { buffer, filename } = await renderShippingLabels(
      parsed.data.orderNumbers,
      session.email,
    );
    void clientIp(request);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not render labels." },
      { status: 400 },
    );
  }
}
