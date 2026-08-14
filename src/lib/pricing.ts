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
    id: "duo",
    label: "Any 2 tees",
    minQty: 2,
    discountType: "flat",
    value: 100, // TODO: Replace with the real 2-tee discount.
    blurb: "Save ₹100",
  },
  {
    id: "trio",
    label: "Any 3 tees",
    minQty: 3,
    discountType: "fixedPrice",
    value: 799, // TODO: Replace with the real 3-tee bundle price.
    blurb: "Save ₹398",
  },
  {
    id: "five",
    label: "Any 5 tees",
    minQty: 5,
    discountType: "fixedPrice",
    value: 1299, // TODO: Replace with the real 5-tee bundle price.
    blurb: "Save ₹696",
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
