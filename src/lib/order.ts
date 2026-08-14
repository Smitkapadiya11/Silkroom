export function whatsappUrl(message: string) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP?.replace(/\D/g, "") ?? "";
  const encoded = encodeURIComponent(message);
  if (number.length >= 10) {
    return `https://wa.me/${number}?text=${encoded}`;
  }
  return `https://wa.me/?text=${encoded}`;
}

export function formatInr(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function orderSingleMessage(name: string, size: string) {
  return `Hello Silk Room, I would like to order the ${name} in size ${size} for ₹399 from silkroom.shop.`;
}

export function orderComboMessage(
  name: string,
  items: string[],
  price: number,
  size: string,
) {
  return `Hello Silk Room, I would like to order ${name} (${items.length} polos) for ${formatInr(price)} from silkroom.shop. Colours: ${items.join(", ")}. Size: ${size}.`;
}

export function orderBrowseMessage() {
  return "Hello Silk Room, I would like to see the polo edit on silkroom.shop.";
}
