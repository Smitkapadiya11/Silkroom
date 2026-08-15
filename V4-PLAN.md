# Silk Room v4 Plan

## Phase 0 findings (pre-fix)
- Contact email is personal Gmail in `src/lib/site.ts` and footer surfaces.
- UGC videos named `menad01` / `menad2`; need meaningful names and verified players.
- Metadata still mentions “Seven tones”; theme-color still dark `#12121A`.
- Combo empty-state copy is awkward at zero selections.
- Public `/order/[orderNumber]` loads without phone verification.
- No admin auth, inventory, fulfillment fields, or audit log yet.
- Order statuses today: `pending`, `paid`, `cod_pending`.

## Schema changes
- Extend `orders` with fulfillment fields and workflow statuses.
- Add `customers`, `inventory`, `inventory_adjustments`, `store_settings`, `admin_audit`.
- Migrate existing `paid` → `confirmed`, keep `cod_pending` → `pending`/`confirmed` mapping carefully.

## Admin route tree
- `/admin/login`
- `/admin` overview
- `/admin/orders`, `/admin/orders/[orderNumber]`
- `/admin/scan`
- `/admin/customers`, `/admin/customers/[phone]`
- `/admin/inventory`
- `/admin/settings`
- `/api/admin/*` session-checked APIs

## Auth approach
- Auth.js v5 Credentials + JWT, 8h sliding cookie.
- Single admin via `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH`.
- Middleware + server session checks; Upstash login rate limit; audit every attempt.
