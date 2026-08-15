import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let client: ReturnType<typeof postgres> | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not configured.");
  }
  if (!dbInstance) {
    client = postgres(url, {
      prepare: false,
      max: 1,
      connect_timeout: 10,
      connection: { statement_timeout: 10000 },
    });
    dbInstance = drizzle(client, { schema });
  }
  return dbInstance;
}
