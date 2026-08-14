/** Digits-only fallback so production never ships dead order buttons. */
const DEFAULT_WHATSAPP = "917575807403";

export function whatsappOrderNumber() {
  const configured = process.env.NEXT_PUBLIC_WHATSAPP?.replace(/\D/g, "") ?? "";
  const number = configured.length >= 10 ? configured : DEFAULT_WHATSAPP;
  return number.length >= 10 ? number : null;
}

export function isWhatsAppOrderingAvailable() {
  return Boolean(whatsappOrderNumber());
}

export function whatsappUrl(message: string) {
  const number = whatsappOrderNumber();
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : null;
}

export function formatInr(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function orderSingleMessage(name: string, size: string) {
  return `Hello Silk Room, I would like to order the ${name} in size ${size} for ₹399.`;
}

export function orderComboMessage(
  name: string,
  items: string[],
  price: number,
  size: string,
) {
  return `Hello Silk Room, I would like to order ${name} (${items.length} polos) for ${formatInr(price)}. Colours: ${items.join(", ")}. Size: ${size}.`;
}

export function orderBrowseMessage() {
  return "Hello Silk Room, I would like to see the polo edit.";
}
