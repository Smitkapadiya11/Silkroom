export type ComboRule = {
  id: string;
  label: string;
  minQty: number;
  discountType: "percent" | "flat" | "fixedPrice";
  value: number;
  blurb: string;
};

export const UNIT_PRICE = 399;

export const comboRules: ComboRule[] = [
  {
    id: "trio",
    label: "Any 3 polos",
    minQty: 3,
    discountType: "fixedPrice",
    value: 799, // TODO: Confirm the real 3-polo bundle price.
    blurb: "3 polos for ₹799 · save ₹398",
  },
  {
    id: "five",
    label: "Any 5 polos",
    minQty: 5,
    discountType: "fixedPrice",
    value: 1299, // TODO: Confirm the real 5-polo bundle price.
    blurb: "5 polos for ₹1,299 · save ₹696",
  },
];

export type CartLine = {
  slug: string;
  price: number;
  quantity: number;
};

export type PricingResult = {
  subtotal: number;
  discount: number;
  total: number;
  rule: ComboRule | null;
  nextRule: ComboRule | null;
  itemsToNext: number;
  nextSaving: number;
};

export function formatInr(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function getApplicableRule(quantity: number) {
  return (
    [...comboRules]
      .filter((rule) => quantity >= rule.minQty)
      .sort((a, b) => b.minQty - a.minQty)[0] ?? null
  );
}

export function getNextRule(quantity: number) {
  return (
    comboRules
      .filter((rule) => quantity < rule.minQty)
      .sort((a, b) => a.minQty - b.minQty)[0] ?? null
  );
}

export function calculateLineTotal(line: CartLine) {
  return line.price * line.quantity;
}

export function calculateCartPricing(lines: CartLine[]): PricingResult {
  const subtotal = lines.reduce((sum, line) => sum + calculateLineTotal(line), 0);
  const quantity = lines.reduce((sum, line) => sum + line.quantity, 0);
  const rule = getApplicableRule(quantity);
  const nextRule = getNextRule(quantity);

  let discount = 0;
  if (rule) {
    if (rule.discountType === "percent") {
      discount = Math.round(subtotal * (rule.value / 100));
    } else if (rule.discountType === "flat") {
      discount = rule.value;
    } else {
      discount = Math.max(0, subtotal - rule.value);
    }
  }

  const total = Math.max(0, subtotal - discount);
  const itemsToNext = nextRule ? nextRule.minQty - quantity : 0;
  const unitPrice = quantity > 0 ? Math.round(subtotal / quantity) : UNIT_PRICE;
  const nextSubtotal = subtotal + itemsToNext * unitPrice;
  let nextDiscount = 0;
  if (nextRule) {
    if (nextRule.discountType === "percent") {
      nextDiscount = Math.round(nextSubtotal * (nextRule.value / 100));
    } else if (nextRule.discountType === "flat") {
      nextDiscount = nextRule.value;
    } else {
      nextDiscount = Math.max(0, nextSubtotal - nextRule.value);
    }
  }
  const nextSaving = Math.max(0, nextDiscount - discount);

  return {
    subtotal,
    discount,
    total,
    rule,
    nextRule,
    itemsToNext,
    nextSaving,
  };
}

export function getBestOfferCopy() {
  const best = comboRules[comboRules.length - 1];
  return `${best.label} for ${formatInr(best.value)} · ${best.blurb}`;
}
