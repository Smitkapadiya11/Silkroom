import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const sql = postgres(url, { prepare: false, max: 1 });

await sql.unsafe(`
INSERT INTO inventory (product_slug, size, quantity, low_stock_threshold)
SELECT slug, size, 25, 5
FROM (VALUES
  ('nocturne-zip-polo'),('umber-zip-polo'),('reed-zip-polo'),('sage-zip-polo'),('rose-zip-polo'),('silver-zip-polo'),('chalk-zip-polo'),
  ('fern-waffle-zip-polo'),('harbour-waffle-zip-polo'),('slate-waffle-zip-polo'),('porcelain-waffle-zip-polo')
) AS p(slug)
CROSS JOIN (VALUES ('S'),('M'),('L'),('XL')) AS s(size)
ON CONFLICT (product_slug, size) DO NOTHING;
`);

const [{ c }] = await sql`select count(*)::int as c from inventory`;
console.log("inventory_rows", c);
await sql.end({ timeout: 5 });
