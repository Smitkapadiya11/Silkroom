import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
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
