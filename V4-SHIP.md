# Silk Room v4 ship checklist

## 1. Environment variables

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Supabase project → Connect → Transaction pooler URI |
| `AUTH_SECRET` | Random 32+ byte hex (already set in Vercel production) |
| `ADMIN_EMAIL` | `smitkapadiya.work@gmail.com` (already set) |
| `ADMIN_PASSWORD_HASH` | Run `npm run hash-password` locally, paste bcrypt hash into Vercel |
| `NEXT_PUBLIC_CONTACT_EMAIL` | `hello@silkroom.shop` (already set; mailbox must be created/forwarded) |
| `ORDER_ACCESS_SECRET` | Random secret for order-page cookies (already set) |
| `UPSTASH_REDIS_REST_URL` | https://console.upstash.com → Create Redis → REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Same Upstash Redis → REST TOKEN |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET` | Razorpay dashboard |
| `NEXT_PUBLIC_SITE_URL` | `https://www.silkroom.shop` |
| `NEXT_PUBLIC_WHATSAPP` | Digits only with country code |

## 2. Admin password hash

```bash
npm run hash-password
```

Paste the printed hash into Vercel as `ADMIN_PASSWORD_HASH` (Production + Preview), then redeploy.

Do not commit the password or hash.

## 3. Migrations (in order)

1. `drizzle/0000_silkroom_orders.sql`
2. `drizzle/0001_reviews.sql`
3. `drizzle/0002_new_design_products.sql`
4. `drizzle/0003_admin_operations.sql` ← applied on active DB

## 4. Phase 0 fixes shipped

- Contact email → `NEXT_PUBLIC_CONTACT_EMAIL` / `hello@silkroom.shop`
- Videos renamed to `silkroom-street-ad` / `silkroom-cafe-ad`
- Metadata + OG image lead with `3 FOR ₹799`; theme-color `#f6f2ea`
- Look closer uses real waffle collar/rib crops
- Combo empty/partial/complete copy + only 3 or 5 can add to cart
- Per-item sizes already work for distinct colours
- Order detail requires access cookie after checkout or phone-verified track
- `robots.ts` disallows `/admin` and `/order/`

## 5. Outstanding TODOs

- `src/lib/site.ts` Instagram URL / followers / full address
- `src/lib/pricing.ts` confirm combo prices with unit
- `src/lib/products.ts` waffle GSM confirm
- Package weight/dimensions defaults in settings — confirm with real packing
- Upstash Redis must be created by account owner for login rate limits
- `hello@silkroom.shop` mailbox / forwarding must be configured at the DNS/email host

## 6. Could not complete for you

- Creating Upstash Redis (requires your Upstash account)
- Choosing/storing your admin password (you must run `npm run hash-password`)
- Creating the `hello@silkroom.shop` mailbox
