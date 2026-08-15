INSERT INTO products (slug, name, price_inr) VALUES
  ('fern-waffle-zip-polo', 'Fern Waffle Zip Polo', 399),
  ('harbour-waffle-zip-polo', 'Harbour Waffle Zip Polo', 399),
  ('slate-waffle-zip-polo', 'Slate Waffle Zip Polo', 399),
  ('porcelain-waffle-zip-polo', 'Porcelain Waffle Zip Polo', 399)
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, price_inr = EXCLUDED.price_inr, active = true;
