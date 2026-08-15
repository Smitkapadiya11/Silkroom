CREATE TABLE IF NOT EXISTS products (
  slug text PRIMARY KEY,
  name text NOT NULL,
  price_inr integer NOT NULL,
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS order_counters (
  year integer PRIMARY KEY,
  last_value integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  status text NOT NULL,
  payment_method text NOT NULL,
  customer_name text NOT NULL,
  phone text NOT NULL,
  email text,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text NOT NULL,
  pincode text NOT NULL,
  subtotal_inr integer NOT NULL,
  discount_inr integer NOT NULL DEFAULT 0,
  fee_inr integer NOT NULL DEFAULT 0,
  prepaid_discount_inr integer NOT NULL DEFAULT 0,
  total_inr integer NOT NULL,
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS orders_razorpay_order_id_uidx
  ON orders (razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS orders_phone_idx ON orders (phone);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_slug text NOT NULL,
  product_name text NOT NULL,
  color text NOT NULL,
  size text NOT NULL,
  unit_price_inr integer NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  line_total_inr integer NOT NULL
);

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items (order_id);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

INSERT INTO products (slug, name, price_inr) VALUES
  ('nocturne-zip-polo', 'Nocturne Zip Polo', 399),
  ('umber-zip-polo', 'Umber Zip Polo', 399),
  ('reed-zip-polo', 'Reed Zip Polo', 399),
  ('sage-zip-polo', 'Sage Zip Polo', 399),
  ('rose-zip-polo', 'Rose Zip Polo', 399),
  ('silver-zip-polo', 'Silver Zip Polo', 399),
  ('chalk-zip-polo', 'Chalk Zip Polo', 399)
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, price_inr = EXCLUDED.price_inr, active = true;
