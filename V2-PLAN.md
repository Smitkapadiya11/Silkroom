# Silk Room v2 plan

## Page order
Offer bar → combo-led hero → linked trust strip → builder → direct-from-Surat
explanation → fabric specification receipt → authentic-detail-photo placeholders →
placeholder-marked review module → delivery steps → colour row → FAQ → final combo
CTA → footer.

## Component tree
`app/page` renders `V2Landing`; its sections use `ComboBuilder`, `TrustStrip`,
`FabricSpecs`, `DetailGallery`, `Reviews`, `DeliverySteps`, `ProductColourRow`,
`FaqAccordion`, and `StoreFooter`. Existing product and policy routes remain.

## Checkout
`/cart` is a full cart view; `/checkout` collects address with zod/react-hook-form;
`/checkout/payment` offers prepaid or COD; `/order/[orderNumber]` is the order
receipt/status view; `/track` is a phone + order-number lookup. The cart moves to a
persisted Zustand store. WhatsApp remains a secondary contact path.

## Persistence and API
Drizzle/Postgres: `products`, `orders`, `order_items`. Server routes:
`POST /api/checkout/create-order`, `POST /api/checkout/verify`,
`POST /api/webhooks/razorpay`, plus COD creation and order lookup. Server recomputes
catalogue prices, validates address/phone, creates human-readable `SR-YY-####` IDs,
and uses idempotent status updates. Secrets remain server-only.

## Delivery order
1. Install dependencies and create the v2 visual tokens.
2. Replace the landing page and add checkout/cart routes.
3. Add database and payment/webhook integrations once `DATABASE_URL`,
`RAZORPAY_WEBHOOK_SECRET`, and test-mode keys are available.
4. Add Resend receipts once `RESEND_API_KEY` and verified sender are available.
5. Run build, responsive/e2e checks, then deploy.
