# Silk Room Phase 2 plan

## Routes

- `/` retains the current landing page and changes product media, hero, shot-silk colour, and rail to 1:1 anime.js scroll-linked motion.
- `/shop`, `/product/[slug]`, `/combos`, `/about`, `/size-guide`, `/shipping-returns`, `/faq`, `/contact`, `/privacy`, `/terms`, and `/order-confirmed` share a store shell.

## Structure

- `src/lib/products.ts`, `pricing.ts`, `cart.ts`, and `site.ts` contain catalog, offer, checkout, and contact facts.
- `src/components/store/*` holds the header, footer, product cards, cart, combo builder, placeholder frame, and trust UI.
- `src/context/CartContext.tsx` persists cart state to local storage and drives the WhatsApp checkout handoff.
- Route-specific server components own metadata and JSON-LD; client components own filters, cart, animation, gallery, and checkout.

## Motion and performance

- `src/hooks/useReelMotion.ts` uses anime.js v4 `onScroll()` for hero/media/rail/shot-silk transforms at `sync: true` on touch and `sync: 0.25` only for fine desktop pointers.
- One-shot grid and copy reveals remain IntersectionObserver-driven.
- Snap moves to `proximity`; no backdrop filters or blur filters; offscreen panels use `content-visibility`.

## Phase order

1. Repair scroll-linked motion and performance rules.
2. Add shared store shell and pricing/cart infrastructure.
3. Build store, product, combo, trust, utility, and policy routes.
4. Add SEO assets, validate all viewports, commit, then configure remote/deploy only after authentication is available.
