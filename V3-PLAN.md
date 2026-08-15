# Silk Room v3 plan

## Fixes first
- Make the offer bar and header one sticky stack, with localStorage dismissal and
  a scrolled opaque header state.
- Rebuild the product buy block, size controls and mobile purchase bar; keep the
  gallery sticky on desktop.
- Replace the mobile menu with an opaque, high-contrast navigation.

## Store upgrades
- Add product `category` and new-arrival support, then move shop filtering into
  shareable URL query parameters with touch-friendly chips and quick add.
- Keep the existing price engine and cart persistence; upgrade combo selections
  to retain a size per selected product.
- Remove customer-visible review/detail placeholders and use an honest founder
  guarantee until genuine assets arrive.

## Media and commerce
- Import and optimise the four supplied designs when their source files are
  present under `E:\projects\t-shirt\new designs`.
- Add the UGC video slot only when a real `public/video/silkroom-ugc.mp4`,
  WebM and poster exist; otherwise omit it from the public page.
- Connect `DATABASE_URL` in Vercel, validate the production database schema,
  then verify COD and Razorpay order creation.
