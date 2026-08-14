export type { Product, ProductReview, ComboPreset } from "@/lib/products";
export {
  UNIT_PRICE,
  SIZES,
  products,
  comboPresets,
  getProduct,
  productsBySlug,
  getRelatedProducts,
} from "@/lib/products";

import { comboRules } from "@/lib/pricing";
import type { ComboPreset } from "@/lib/products";
import { UNIT_PRICE, comboPresets } from "@/lib/products";

/** @deprecated Use UNIT_PRICE from lib/products */
export const PRICE = {
  single: UNIT_PRICE,
  trio: comboRules.find((rule) => rule.id === "trio")?.value ?? 799,
  five: comboRules.find((rule) => rule.id === "five")?.value ?? 1299,
} as const;

export type Combo = ComboPreset & { price: number };

export const combos: Combo[] = comboPresets.map((combo) => ({
  ...combo,
  price:
    combo.count === 3
      ? (comboRules.find((rule) => rule.id === "trio")?.value ?? 799)
      : (comboRules.find((rule) => rule.id === "five")?.value ?? 1299),
}));

export function comboSaving(combo: Combo) {
  return combo.count * UNIT_PRICE - combo.price;
}
