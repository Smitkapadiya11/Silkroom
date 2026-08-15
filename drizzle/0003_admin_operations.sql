-- Silk Room v4 operations schema

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS awb_number text,
  ADD COLUMN IF NOT EXISTS courier text,
  ADD COLUMN IF NOT EXISTS dispatched_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS internal_notes text,
  ADD COLUMN IF NOT EXISTS cancel_reason text,
  ADD COLUMN IF NOT EXISTS label_printed_at timestamptz,
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS packed_at timestamptz;

UPDATE orders SET status = 'confirmed', confirmed_at = COALESCE(confirmed_at, updated_at)
WHERE status = 'paid';

UPDATE orders SET status = 'pending'
WHERE status = 'cod_pending';

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  name text NOT NULL,
  email text,
  first_order_at timestamptz NOT NULL,
  last_order_at timestamptz NOT NULL,
  order_count integer NOT NULL DEFAULT 0,
  lifetime_value integer NOT NULL DEFAULT 0,
  cod_order_count integer NOT NULL DEFAULT 0,
  rto_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS customers_phone_uidx ON customers (phone);

CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_slug text NOT NULL,
  size text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  low_stock_threshold integer NOT NULL DEFAULT 5,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS inventory_product_size_uidx ON inventory (product_slug, size);

CREATE TABLE IF NOT EXISTS inventory_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id uuid NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  delta integer NOT NULL,
  reason text NOT NULL,
  actor_email text,
  order_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS store_settings (
  id text PRIMARY KEY DEFAULT 'default',
  contact_email text NOT NULL DEFAULT 'hello@silkroom.shop',
  contact_phone text NOT NULL DEFAULT '+91 75758 07403',
  return_address text NOT NULL DEFAULT 'Silk Room, Surat, Gujarat, India',
  response_hours text NOT NULL DEFAULT 'Mon–Sat, 10am–7pm IST',
  combo_3_price_inr integer NOT NULL DEFAULT 799,
  combo_5_price_inr integer NOT NULL DEFAULT 1299,
  unit_price_inr integer NOT NULL DEFAULT 399,
  cod_fee_inr integer NOT NULL DEFAULT 49,
  prepaid_discount_inr integer NOT NULL DEFAULT 0,
  free_delivery_threshold_inr integer NOT NULL DEFAULT 799,
  package_weight_grams integer NOT NULL DEFAULT 350,
  package_length_cm integer NOT NULL DEFAULT 30,
  package_width_cm integer NOT NULL DEFAULT 25,
  package_height_cm integer NOT NULL DEFAULT 4,
  announcement_enabled boolean NOT NULL DEFAULT true,
  announcement_text text NOT NULL DEFAULT '3 polos ₹799 · 5 for ₹1,299 · Free delivery over ₹799 · COD available',
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO store_settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS admin_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_email text NOT NULL,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  ip_address text,
  meta text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stock_notify (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_slug text NOT NULL,
  size text NOT NULL,
  phone text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Seed inventory for known catalogue sizes at a starting quantity.
INSERT INTO inventory (product_slug, size, quantity, low_stock_threshold)
SELECT slug, size, 25, 5
FROM (
  VALUES
    ('nocturne-zip-polo'),
    ('umber-zip-polo'),
    ('reed-zip-polo'),
    ('sage-zip-polo'),
    ('rose-zip-polo'),
    ('silver-zip-polo'),
    ('chalk-zip-polo'),
    ('fern-waffle-zip-polo'),
    ('harbour-waffle-zip-polo'),
    ('slate-waffle-zip-polo'),
    ('porcelain-waffle-zip-polo')
) AS p(slug)
CROSS JOIN (VALUES ('S'), ('M'), ('L'), ('XL')) AS s(size)
ON CONFLICT (product_slug, size) DO NOTHING;
