import { sql } from "drizzle-orm";
import { orders } from "@/db/schema";

export function isUnpaidPrepaid(order: {
  paymentMethod: string;
  status: string;
  razorpayPaymentId?: string | null;
}) {
  if (order.paymentMethod !== "prepaid") return false;
  if (order.status === "awaiting_payment") return true;
  return order.status === "pending" && !order.razorpayPaymentId;
}

export const unpaidPrepaidClause = sql`(
  ${orders.paymentMethod} = 'prepaid'
  and ${orders.razorpayPaymentId} is null
  and ${orders.status} in ('pending', 'awaiting_payment')
)`;

export const paidOrderClause = sql`not ${unpaidPrepaidClause}`;

export function istDayStart(daysAgo = 0) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const start = new Date(`${parts}T00:00:00+05:30`);
  start.setDate(start.getDate() - daysAgo);
  return start.toISOString();
}

export function paymentLabel(order: {
  paymentMethod: string;
  status: string;
  razorpayPaymentId?: string | null;
}) {
  if (isUnpaidPrepaid(order)) return "Prepaid · unpaid";
  if (order.paymentMethod === "prepaid") return "Prepaid · paid";
  return "Unpaid · collect";
}
