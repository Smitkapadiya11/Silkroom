import { getDb, isDatabaseConfigured } from "@/db";
import { adminAudit } from "@/db/schema";

export async function writeAdminAudit(input: {
  actorEmail: string;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  ipAddress?: string | null;
  meta?: string | null;
}) {
  if (!isDatabaseConfigured()) return;
  try {
    const db = getDb();
    await db.insert(adminAudit).values({
      actorEmail: input.actorEmail,
      action: input.action,
      entityType: input.entityType ?? null,
      entityId: input.entityId ?? null,
      ipAddress: input.ipAddress ?? null,
      meta: input.meta ?? null,
    });
  } catch {
    // Auth must still fail closed even if audit logging is unavailable.
  }
}
