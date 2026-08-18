import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  priceInr: integer("price_inr").notNull(),
  active: boolean("active").notNull().default(true),
});

export const orderCounters = pgTable("order_counters", {
  year: integer("year").primaryKey(),
  lastValue: integer("last_value").notNull().default(0),
});

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  status: text("status").notNull(),
  paymentMethod: text("payment_method").notNull(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: text("pincode").notNull(),
  subtotalInr: integer("subtotal_inr").notNull(),
  discountInr: integer("discount_inr").notNull().default(0),
  feeInr: integer("fee_inr").notNull().default(0),
  prepaidDiscountInr: integer("prepaid_discount_inr").notNull().default(0),
  totalInr: integer("total_inr").notNull(),
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  razorpaySignature: text("razorpay_signature"),
  notes: text("notes"),
  awbNumber: text("awb_number"),
  courier: text("courier"),
  dispatchedAt: timestamp("dispatched_at", { withTimezone: true }),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  internalNotes: text("internal_notes"),
  cancelReason: text("cancel_reason"),
  labelPrintedAt: timestamp("label_printed_at", { withTimezone: true }),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  packedAt: timestamp("packed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productSlug: text("product_slug").notNull(),
  productName: text("product_name").notNull(),
  color: text("color").notNull(),
  size: text("size").notNull(),
  unitPriceInr: integer("unit_price_inr").notNull(),
  quantity: integer("quantity").notNull(),
  lineTotalInr: integer("line_total_inr").notNull(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productSlug: text("product_slug").notNull(),
  rating: integer("rating").notNull(),
  body: text("body").notNull(),
  verifiedPurchase: boolean("verified_purchase").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    phone: text("phone").notNull(),
    name: text("name").notNull(),
    email: text("email"),
    firstOrderAt: timestamp("first_order_at", { withTimezone: true }).notNull(),
    lastOrderAt: timestamp("last_order_at", { withTimezone: true }).notNull(),
    orderCount: integer("order_count").notNull().default(0),
    lifetimeValue: integer("lifetime_value").notNull().default(0),
    codOrderCount: integer("cod_order_count").notNull().default(0),
    rtoCount: integer("rto_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("customers_phone_uidx").on(table.phone)],
);

export const inventory = pgTable(
  "inventory",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productSlug: text("product_slug").notNull(),
    size: text("size").notNull(),
    quantity: integer("quantity").notNull().default(0),
    lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("inventory_product_size_uidx").on(table.productSlug, table.size)],
);

export const inventoryAdjustments = pgTable("inventory_adjustments", {
  id: uuid("id").defaultRandom().primaryKey(),
  inventoryId: uuid("inventory_id")
    .notNull()
    .references(() => inventory.id, { onDelete: "cascade" }),
  delta: integer("delta").notNull(),
  reason: text("reason").notNull(),
  actorEmail: text("actor_email"),
  orderId: uuid("order_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const storeSettings = pgTable("store_settings", {
  id: text("id").primaryKey().default("default"),
  contactEmail: text("contact_email").notNull().default("hello@silkroom.shop"),
  contactPhone: text("contact_phone").notNull().default("+91 75758 07403"),
  returnAddress: text("return_address").notNull().default("Silk Room, Surat, Gujarat, India"),
  responseHours: text("response_hours").notNull().default("Mon–Sat, 10am–7pm IST"),
  combo3PriceInr: integer("combo_3_price_inr").notNull().default(799),
  combo5PriceInr: integer("combo_5_price_inr").notNull().default(1299),
  unitPriceInr: integer("unit_price_inr").notNull().default(399),
  codFeeInr: integer("cod_fee_inr").notNull().default(49),
  prepaidDiscountInr: integer("prepaid_discount_inr").notNull().default(0),
  freeDeliveryThresholdInr: integer("free_delivery_threshold_inr").notNull().default(799),
  packageWeightGrams: integer("package_weight_grams").notNull().default(350),
  packageLengthCm: integer("package_length_cm").notNull().default(30),
  packageWidthCm: integer("package_width_cm").notNull().default(25),
  packageHeightCm: integer("package_height_cm").notNull().default(4),
  announcementEnabled: boolean("announcement_enabled").notNull().default(true),
  announcementText: text("announcement_text")
    .notNull()
    .default("3 polos ₹799 · 5 for ₹1,299 · Free delivery over ₹799 · Secure prepaid checkout"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminAudit = pgTable("admin_audit", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorEmail: text("actor_email").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  ipAddress: text("ip_address"),
  meta: text("meta"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const stockNotify = pgTable("stock_notify", {
  id: uuid("id").defaultRandom().primaryKey(),
  productSlug: text("product_slug").notNull(),
  size: text("size").notNull(),
  phone: text("phone"),
  email: text("email"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
