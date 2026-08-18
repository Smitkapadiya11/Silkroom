import bwipjs from "bwip-js";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import { createElement } from "react";
import { eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { orderItems, orders, storeSettings } from "@/db/schema";
import { formatInr } from "@/lib/pricing";
import { writeAdminAudit } from "@/lib/admin/audit";

async function barcodePng(orderNumber: string) {
  const png = await bwipjs.toBuffer({
    bcid: "code128",
    text: orderNumber,
    scale: 4,
    height: 18,
    includetext: true,
    textsize: 11,
    textxalign: "center",
    backgroundcolor: "FFFFFF",
  });
  return `data:image/png;base64,${png.toString("base64")}`;
}

async function loadOrders(orderNumbers: string[]) {
  const db = getDb();
  const rows = await db
    .select()
    .from(orders)
    .where(inArray(orders.orderNumber, orderNumbers.map((n) => n.toUpperCase())));
  const items = rows.length
    ? await db
        .select()
        .from(orderItems)
        .where(
          inArray(
            orderItems.orderId,
            rows.map((row) => row.id),
          ),
        )
    : [];
  const [settings] = await db.select().from(storeSettings).where(eq(storeSettings.id, "default")).limit(1);
  return { rows, items, settings };
}

const labelStyles = StyleSheet.create({
  page: {
    padding: 10,
    fontSize: 9,
    fontFamily: "Helvetica",
  },
  banner: {
    backgroundColor: "#111",
    color: "#fff",
    textAlign: "center",
    padding: 8,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: 700,
  },
  section: { marginBottom: 6, borderBottom: "1 solid #ddd", paddingBottom: 6 },
  title: { fontSize: 8, fontWeight: 700, marginBottom: 3, letterSpacing: 0.6 },
  name: { fontSize: 12, fontWeight: 700 },
  mono: { fontFamily: "Courier", fontSize: 11 },
  pincode: { fontSize: 22, fontWeight: 700, marginTop: 2 },
  barcode: { width: 250, height: 64, marginTop: 4, marginBottom: 2 },
  small: { fontSize: 8, color: "#333" },
  row: { fontSize: 9, marginBottom: 2 },
});

function LabelDoc({
  orders: orderRows,
  items,
  settings,
  barcodes,
}: {
  orders: (typeof orders.$inferSelect)[];
  items: (typeof orderItems.$inferSelect)[];
  settings: typeof storeSettings.$inferSelect | undefined;
  barcodes: Record<string, string>;
}) {
  return createElement(
    Document,
    null,
    ...orderRows.map((order) => {
      const orderItemRows = items.filter((item) => item.orderId === order.id);
      const banner =
        order.paymentMethod === "cod"
          ? `COD — COLLECT ${formatInr(order.totalInr)}`
          : "PREPAID — DO NOT COLLECT";
      return createElement(
        Page,
        { key: order.id, size: [288, 432], style: labelStyles.page },
        createElement(View, { style: labelStyles.banner }, createElement(Text, null, banner)),
        createElement(
          View,
          { style: labelStyles.section },
          createElement(Text, { style: labelStyles.title }, "TO / SHIP TO"),
          createElement(Text, { style: labelStyles.name }, order.customerName),
          createElement(Text, null, order.addressLine1),
          order.addressLine2 ? createElement(Text, null, order.addressLine2) : null,
          createElement(Text, null, `${order.city}, ${order.state}`),
          createElement(Text, { style: labelStyles.pincode }, `PIN ${order.pincode}`),
          createElement(Text, { style: labelStyles.mono }, order.phone),
        ),
        createElement(
          View,
          { style: labelStyles.section },
          createElement(Text, { style: labelStyles.title }, "FROM"),
          createElement(Text, null, "Silk Room"),
          createElement(Text, null, settings?.returnAddress ?? "Surat, Gujarat, India"),
          createElement(Text, null, settings?.contactPhone ?? ""),
        ),
        createElement(
          View,
          { style: labelStyles.section },
          createElement(Text, { style: labelStyles.title }, "ORDER BARCODE"),
          createElement(Image, { style: labelStyles.barcode, src: barcodes[order.orderNumber] }),
          createElement(Text, { style: labelStyles.mono }, order.orderNumber),
        ),
        createElement(
          View,
          { style: labelStyles.section },
          createElement(Text, { style: labelStyles.title }, "ITEMS"),
          ...orderItemRows.map((item) =>
            createElement(
              Text,
              { key: item.id, style: labelStyles.row },
              `${item.quantity}× ${item.productName} · ${item.color} / ${item.size}`,
            ),
          ),
        ),
        createElement(
          View,
          { style: labelStyles.section },
          createElement(Text, { style: labelStyles.small }, "Leave blank for courier AWB sticker"),
          createElement(Text, { style: labelStyles.small }, `Generated ${new Date().toISOString()}`),
        ),
      );
    }),
  );
}

const slipStyles = StyleSheet.create({
  page: { padding: 24, fontSize: 10, fontFamily: "Helvetica" },
  title: { fontSize: 14, fontWeight: 700, marginBottom: 8 },
  mono: { fontFamily: "Courier", marginBottom: 8 },
  barcode: { width: 200, height: 44, marginBottom: 8 },
  row: { marginBottom: 4 },
});

function SlipDoc({
  orders: orderRows,
  items,
  settings,
  barcodes,
}: {
  orders: (typeof orders.$inferSelect)[];
  items: (typeof orderItems.$inferSelect)[];
  settings: typeof storeSettings.$inferSelect | undefined;
  barcodes: Record<string, string>;
}) {
  return createElement(
    Document,
    null,
    ...orderRows.map((order) => {
      const orderItemRows = items.filter((item) => item.orderId === order.id);
      return createElement(
        Page,
        { key: order.id, size: "A5", style: slipStyles.page },
        createElement(Text, { style: slipStyles.title }, "Silk Room packing slip"),
        createElement(Image, { style: slipStyles.barcode, src: barcodes[order.orderNumber] }),
        createElement(Text, { style: slipStyles.mono }, order.orderNumber),
        ...orderItemRows.map((item) =>
          createElement(
            Text,
            { key: item.id, style: slipStyles.row },
            `${item.productName} · ${item.color} · ${item.size} × ${item.quantity}`,
          ),
        ),
        createElement(
          Text,
          { style: { marginTop: 12, fontWeight: 700 } },
          order.paymentMethod === "cod"
            ? `COD due: ${formatInr(order.totalInr)}`
            : `Paid: ${formatInr(order.totalInr)}`,
        ),
        createElement(
          Text,
          { style: { marginTop: 16 } },
          `Exchange within 7 days — WhatsApp ${settings?.contactPhone ?? ""}`,
        ),
        createElement(
          Text,
          { style: { marginTop: 8 } },
          "Thank you for choosing Silk Room. Wear it soft, wear it often.",
        ),
      );
    }),
  );
}

export async function renderShippingLabels(orderNumbers: string[], actorEmail: string) {
  const { rows, items, settings } = await loadOrders(orderNumbers);
  if (!rows.length) throw new Error("No orders found.");
  const barcodes: Record<string, string> = {};
  for (const row of rows) {
    barcodes[row.orderNumber] = await barcodePng(row.orderNumber);
  }
  const buffer = await renderToBuffer(
    createElement(LabelDoc, { orders: rows, items, settings, barcodes }) as never,
  );
  const db = getDb();
  const now = new Date();
  for (const row of rows) {
    await db.update(orders).set({ labelPrintedAt: now, updatedAt: now }).where(eq(orders.id, row.id));
    await writeAdminAudit({
      actorEmail,
      action: "label_printed",
      entityType: "order",
      entityId: row.orderNumber,
    });
  }
  const stamp = now.toISOString().slice(0, 10);
  return {
    buffer,
    filename: `silkroom-labels-${stamp}-${rows.length}.pdf`,
  };
}

export async function renderPackingSlips(orderNumbers: string[], actorEmail: string) {
  const { rows, items, settings } = await loadOrders(orderNumbers);
  if (!rows.length) throw new Error("No orders found.");
  const barcodes: Record<string, string> = {};
  for (const row of rows) {
    barcodes[row.orderNumber] = await barcodePng(row.orderNumber);
  }
  const buffer = await renderToBuffer(
    createElement(SlipDoc, { orders: rows, items, settings, barcodes }) as never,
  );
  await writeAdminAudit({
    actorEmail,
    action: "packing_slips_printed",
    entityType: "orders",
    entityId: rows.map((row) => row.orderNumber).join(","),
  });
  const stamp = new Date().toISOString().slice(0, 10);
  return {
    buffer,
    filename: `silkroom-packing-slips-${stamp}-${rows.length}.pdf`,
  };
}
