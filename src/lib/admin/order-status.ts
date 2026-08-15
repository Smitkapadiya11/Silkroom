export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "packed",
  "dispatched",
  "delivered",
  "cancelled",
  "rto",
  "refunded",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["packed", "cancelled"],
  packed: ["dispatched", "cancelled"],
  dispatched: ["delivered", "rto"],
  delivered: ["refunded"],
  cancelled: [],
  rto: ["refunded"],
  refunded: [],
};

export function canTransition(from: string, to: string) {
  if (!(ORDER_STATUSES as readonly string[]).includes(from)) return false;
  if (!(ORDER_STATUSES as readonly string[]).includes(to)) return false;
  return TRANSITIONS[from as OrderStatus].includes(to as OrderStatus);
}

export function normalizeLegacyStatus(status: string): OrderStatus {
  if (status === "paid") return "confirmed";
  if (status === "cod_pending") return "pending";
  if ((ORDER_STATUSES as readonly string[]).includes(status)) {
    return status as OrderStatus;
  }
  return "pending";
}

export function statusLabel(status: string) {
  return normalizeLegacyStatus(status).replace("_", " ");
}
