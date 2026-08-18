export const CLEAN_ANNOUNCEMENT =
  "3 polos ₹799 · 5 for ₹1,299 · Free delivery over ₹799 · Secure prepaid checkout";

export function scrubCodCopy(text: string) {
  if (!/\bcod\b|cash on delivery/i.test(text)) return text;
  return CLEAN_ANNOUNCEMENT;
}
