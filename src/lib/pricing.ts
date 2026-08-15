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

export function getApplicableRule(quantity: number, rules: ComboRule[] = comboRules) {
  return (
    [...rules]
      .filter((rule) => quantity === rule.minQty)
      .sort((a, b) => b.minQty - a.minQty)[0] ?? null
  );
}

export function getNextRule(quantity: number, rules: ComboRule[] = comboRules) {
  return (
    rules
      .filter((rule) => quantity < rule.minQty)
      .sort((a, b) => a.minQty - b.minQty)[0] ?? null
  );
}

export function calculateLineTotal(line: CartLine) {
  return line.price * line.quantity;
}

export function calculateCartPricing(
  lines: CartLine[],
  options?: { rules?: ComboRule[]; unitPrice?: number },
): PricingResult {
  const rules = options?.rules?.length ? options.rules : comboRules;
  const subtotal = lines.reduce((sum, line) => sum + calculateLineTotal(line), 0);
  const quantity = lines.reduce((sum, line) => sum + line.quantity, 0);
  const rule = getApplicableRule(quantity, rules);
  const nextRule = getNextRule(quantity, rules);
  const unitPrice =
    quantity > 0
      ? Math.round(subtotal / quantity)
      : options?.unitPrice && Number.isFinite(options.unitPrice)
        ? options.unitPrice
        : UNIT_PRICE;

  const bundleTotal = (count: number) => {
    const totals = Array.from({ length: count + 1 }, (_, index) => index * unitPrice);
    for (let itemCount = 1; itemCount <= count; itemCount += 1) {
      for (const combo of rules) {
        if (combo.discountType !== "fixedPrice" || combo.minQty > itemCount) continue;
        totals[itemCount] = Math.min(
          totals[itemCount],
          totals[itemCount - combo.minQty] + combo.value,
        );
      }
    }
    return totals[count];
  };

  const total = bundleTotal(quantity);
  const discount = Math.max(0, subtotal - total);
  const itemsToNext = nextRule ? nextRule.minQty - quantity : 0;
  const nextSaving = nextRule
    ? Math.max(
        0,
        (quantity + itemsToNext) * unitPrice - bundleTotal(quantity + itemsToNext) - discount,
      )
    : 0;

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
  const saving =
    best.discountType === "fixedPrice"
      ? best.minQty * UNIT_PRICE - best.value
      : best.value;
  return `${best.label} for ${formatInr(best.value)} · save ${formatInr(saving)}`;
}
