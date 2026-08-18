import { and, desc, eq, gte, ilike, inArray, lte, or, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { customers, inventory, inventoryAdjustments, orderItems, orders } from "@/db/schema";
import { writeAdminAudit } from "@/lib/admin/audit";
import { canTransition, normalizeLegacyStatus, type OrderStatus } from "@/lib/admin/order-status";
import { unpaidPrepaidClause, isUnpaidPrepaid } from "@/lib/commerce";
import { products, SIZES } from "@/lib/products";

export function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) return "••••••••••";
  return `+91 ${digits.slice(0, 5)} •••••`;
}

export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "").slice(-10);
}

export async function upsertCustomerFromOrder(order: {
  phone: string;
  customerName: string;
  email?: string | null;
  paymentMethod: string;
  totalInr: number;
  createdAt: Date;
  status: string;
}) {
  const db = getDb();
  const phone = normalizePhone(order.phone);
  const [existing] = await db.select().from(customers).where(eq(customers.phone, phone)).limit(1);
  const isRto = normalizeLegacyStatus(order.status) === "rto";
  if (!existing) {
    await db.insert(customers).values({
      phone,
      name: order.customerName,
      email: order.email ?? null,
      firstOrderAt: order.createdAt,
      lastOrderAt: order.createdAt,
      orderCount: 1,
      lifetimeValue: order.totalInr,
      codOrderCount: order.paymentMethod === "cod" ? 1 : 0,
      rtoCount: isRto ? 1 : 0,
    });
    return;
  }
  await db
    .update(customers)
    .set({
      name: order.customerName,
      email: order.email ?? existing.email,
      lastOrderAt: order.createdAt > existing.lastOrderAt ? order.createdAt : existing.lastOrderAt,
      orderCount: existing.orderCount + 1,
      lifetimeValue: existing.lifetimeValue + order.totalInr,
      codOrderCount: existing.codOrderCount + (order.paymentMethod === "cod" ? 1 : 0),
      rtoCount: existing.rtoCount + (isRto ? 1 : 0),
      updatedAt: new Date(),
    })
    .where(eq(customers.id, existing.id));
}

export async function ensureInventorySeeded() {
  const db = getDb();
  for (const product of products) {
    for (const size of SIZES) {
      await db
        .insert(inventory)
        .values({
          productSlug: product.slug,
          size,
          quantity: 25,
          lowStockThreshold: 5,
        })
        .onConflictDoNothing();
    }
  }
}

async function adjustInventory(input: {
  productSlug: string;
  size: string;
  delta: number;
  reason: string;
  actorEmail?: string | null;
  orderId?: string | null;
}) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(inventory)
    .where(and(eq(inventory.productSlug, input.productSlug), eq(inventory.size, input.size)))
    .limit(1);
  if (!row) {
    const [created] = await db
      .insert(inventory)
      .values({
        productSlug: input.productSlug,
        size: input.size,
        quantity: Math.max(0, input.delta),
        lowStockThreshold: 5,
      })
      .returning();
    await db.insert(inventoryAdjustments).values({
      inventoryId: created.id,
      delta: input.delta,
      reason: input.reason,
      actorEmail: input.actorEmail ?? null,
      orderId: input.orderId ?? null,
    });
    return created;
  }
  const next = Math.max(0, row.quantity + input.delta);
  const [updated] = await db
    .update(inventory)
    .set({ quantity: next, updatedAt: new Date() })
    .where(eq(inventory.id, row.id))
    .returning();
  await db.insert(inventoryAdjustments).values({
    inventoryId: row.id,
    delta: input.delta,
    reason: input.reason,
    actorEmail: input.actorEmail ?? null,
    orderId: input.orderId ?? null,
  });
  return updated;
}

export async function decrementInventoryForOrder(orderId: string, actorEmail?: string) {
  const db = getDb();
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  for (const item of items) {
    await adjustInventory({
      productSlug: item.productSlug,
      size: item.size,
      delta: -item.quantity,
      reason: "order_confirmed",
      actorEmail,
      orderId,
    });
  }
}

export async function restoreInventoryForOrder(orderId: string, reason: string, actorEmail?: string) {
  const db = getDb();
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  for (const item of items) {
    await adjustInventory({
      productSlug: item.productSlug,
      size: item.size,
      delta: item.quantity,
      reason,
      actorEmail,
      orderId,
    });
  }
}

function rawStatusesForNormalized(status: OrderStatus) {
  if (status === "pending") return ["pending", "cod_pending"];
  if (status === "confirmed") return ["confirmed", "paid"];
  return [status];
}

export async function transitionOrderStatus(input: {
  orderNumber: string;
  to: OrderStatus;
  actorEmail: string;
  ipAddress?: string;
  awbNumber?: string;
  courier?: string;
  cancelReason?: string;
  note?: string;
}) {
  const db = getDb();
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, input.orderNumber.toUpperCase()))
    .limit(1);
  if (!order) return { error: "Order not found." } as const;

  const from = normalizeLegacyStatus(order.status);
  if (!canTransition(from, input.to)) {
    return { error: `Cannot move from ${from} to ${input.to}.` } as const;
  }

  const patch: Partial<typeof orders.$inferInsert> = {
    status: input.to,
    updatedAt: new Date(),
  };
  if (input.to === "confirmed") patch.confirmedAt = new Date();
  if (input.to === "packed") patch.packedAt = new Date();
  if (input.to === "dispatched") {
    patch.dispatchedAt = new Date();
    if (input.awbNumber) patch.awbNumber = input.awbNumber;
    if (input.courier) patch.courier = input.courier;
  }
  if (input.to === "delivered") patch.deliveredAt = new Date();
  if (input.to === "cancelled" && input.cancelReason) patch.cancelReason = input.cancelReason;
  if (input.note) {
    const stamp = new Date().toISOString();
    patch.internalNotes = `${order.internalNotes ? `${order.internalNotes}\n` : ""}[${stamp}] ${input.actorEmail}: ${input.note}`;
  }

  const [updated] = await db
    .update(orders)
    .set(patch)
    .where(and(eq(orders.id, order.id), inArray(orders.status, rawStatusesForNormalized(from))))
    .returning();

  if (!updated) {
    return { error: "Order status changed. Refresh and try again." } as const;
  }

  if (from !== "confirmed" && input.to === "confirmed") {
    await decrementInventoryForOrder(order.id, input.actorEmail);
    await upsertCustomerFromOrder({
      phone: order.phone,
      customerName: order.customerName,
      email: order.email,
      paymentMethod: order.paymentMethod,
      totalInr: order.totalInr,
      createdAt: order.createdAt,
      status: input.to,
    });
  }
  if (["cancelled", "rto"].includes(input.to) && ["confirmed", "packed", "dispatched"].includes(from)) {
    await restoreInventoryForOrder(order.id, `order_${input.to}`, input.actorEmail);
  }
  if (input.to === "rto") {
    const phone = normalizePhone(order.phone);
    const [customer] = await db.select().from(customers).where(eq(customers.phone, phone)).limit(1);
    if (customer) {
      await db
        .update(customers)
        .set({ rtoCount: customer.rtoCount + 1, updatedAt: new Date() })
        .where(eq(customers.id, customer.id));
    }
  }

  await writeAdminAudit({
    actorEmail: input.actorEmail,
    action: `status_${from}_to_${input.to}`,
    entityType: "order",
    entityId: order.orderNumber,
    ipAddress: input.ipAddress,
  });

  return { order: updated } as const;
}

export async function listOrders(input: {
  page: number;
  pageSize: number;
  status?: string;
  paymentMethod?: string;
  courier?: string;
  hasAwb?: boolean;
  from?: string;
  to?: string;
  q?: string;
}) {
  const db = getDb();
  const filters = [];
  if (input.status === "awaiting_payment") filters.push(unpaidPrepaidClause);
  else if (input.status) filters.push(eq(orders.status, input.status));
  else filters.push(sql`not ${unpaidPrepaidClause}`);
  if (input.paymentMethod) filters.push(eq(orders.paymentMethod, input.paymentMethod));
  if (input.courier) filters.push(eq(orders.courier, input.courier));
  if (input.hasAwb === true) filters.push(sql`${orders.awbNumber} is not null`);
  if (input.hasAwb === false) filters.push(sql`${orders.awbNumber} is null`);
  if (input.from) filters.push(gte(orders.createdAt, new Date(input.from)));
  if (input.to) filters.push(lte(orders.createdAt, new Date(input.to)));
  if (input.q) {
    const q = input.q.trim();
    const phone = normalizePhone(q);
    filters.push(
      or(
        ilike(orders.orderNumber, `%${q}%`),
        ilike(orders.customerName, `%${q}%`),
        ilike(orders.email, `%${q}%`),
        phone.length === 10 ? eq(orders.phone, phone) : undefined,
      ),
    );
  }

  const where = filters.length ? and(...filters) : undefined;
  const offset = (input.page - 1) * input.pageSize;
  const rows = await db
    .select()
    .from(orders)
    .where(where)
    .orderBy(desc(orders.createdAt))
    .limit(input.pageSize)
    .offset(offset);
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orders)
    .where(where);

  const orderIds = rows.map((row) => row.id);
  const itemCounts =
    orderIds.length === 0
      ? []
      : await db
          .select({
            orderId: orderItems.orderId,
            count: sql<number>`sum(${orderItems.quantity})::int`,
          })
          .from(orderItems)
          .where(inArray(orderItems.orderId, orderIds))
          .groupBy(orderItems.orderId);

  const countMap = new Map(itemCounts.map((row) => [row.orderId, row.count]));

  return {
    total: count,
    page: input.page,
    pageSize: input.pageSize,
    rows: rows.map((row) => ({
      id: row.id,
      orderNumber: row.orderNumber,
      createdAt: row.createdAt,
      customerName: row.customerName,
      city: row.city,
      itemCount: countMap.get(row.id) ?? 0,
      totalInr: row.totalInr,
      paymentMethod: isUnpaidPrepaid(row) ? "prepaid" : row.paymentMethod,
      status: isUnpaidPrepaid(row) ? "awaiting_payment" : normalizeLegacyStatus(row.status),
      phoneMasked: maskPhone(row.phone),
      courier: row.courier,
      awbNumber: row.awbNumber,
    })),
  };
}
