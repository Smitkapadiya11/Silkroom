import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { and, eq, gte, sql } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { adminAudit } from "@/db/schema";

let limiter: Ratelimit | null = null;

export function getLoginRateLimiter() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  if (!limiter) {
    limiter = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      analytics: true,
      prefix: "silkroom:admin-login",
    });
  }
  return limiter;
}

export async function allowDatabaseLoginAttempt(ipAddress: string) {
  if (!isDatabaseConfigured()) return true;

  try {
    const db = getDb();
    const since = new Date(Date.now() - 15 * 60 * 1000);
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(adminAudit)
      .where(
        and(
          eq(adminAudit.ipAddress, ipAddress),
          eq(adminAudit.action, "login_failed"),
          gte(adminAudit.createdAt, since),
        ),
      );
    return count < 5;
  } catch {
    return false;
  }
}
