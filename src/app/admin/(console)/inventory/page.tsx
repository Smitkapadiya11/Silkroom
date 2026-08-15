import { getDb, isDatabaseConfigured } from "@/db";
import { inventory } from "@/db/schema";
import { ensureInventorySeeded } from "@/lib/admin/orders";
import { InventoryGrid } from "./InventoryGrid";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  if (!isDatabaseConfigured()) {
    return (
      <section className="admin-page">
        <h1>Inventory</h1>
        <p className="admin-muted">DATABASE_URL is not configured.</p>
      </section>
    );
  }

  try {
    await ensureInventorySeeded();
    const rows = await getDb().select().from(inventory);
    const initial = Object.fromEntries(
      rows.map((row) => [`${row.productSlug}:${row.size}`, row.quantity]),
    );
    return (
      <section className="admin-page">
        <h1>Inventory</h1>
        <p className="admin-muted">Changes save when an input loses focus.</p>
        <InventoryGrid initial={initial} />
      </section>
    );
  } catch (error) {
    return (
      <section className="admin-page">
        <h1>Inventory</h1>
        <p className="admin-muted">
          Inventory table is unavailable. Run migration `0003_admin_operations.sql`.
        </p>
        <pre className="admin-muted">
          {error instanceof Error ? error.message : "Unknown error"}
        </pre>
      </section>
    );
  }
}
