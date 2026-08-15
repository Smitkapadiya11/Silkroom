CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_slug text NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body text NOT NULL CHECK (char_length(body) BETWEEN 20 AND 1200),
  verified_purchase boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (order_id, product_slug)
);

CREATE INDEX IF NOT EXISTS reviews_product_slug_idx ON reviews (product_slug, created_at DESC);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
