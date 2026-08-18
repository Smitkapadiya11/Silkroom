"use client";

import Link from "next/link";
import { useCart } from "@/context/CartProvider";
import { formatInr } from "@/lib/pricing";

export function ComboProgressBanner() {
  const { pricing, count } = useCart();

  if (count === 0) return null;

  const progress =
    pricing.nextRule && pricing.nextRule.minQty > 0
      ? Math.min(
          100,
          ((pricing.nextRule.minQty - pricing.itemsToNext) / pricing.nextRule.minQty) * 100,
        )
      : 100;

  return (
    <div className="shop-combo-banner" role="status">
      {pricing.rule && pricing.discount > 0 ? (
        <p>
          <strong>{pricing.rule.blurb}</strong> applied — you save {formatInr(pricing.discount)}
        </p>
      ) : pricing.nextRule && pricing.itemsToNext > 0 ? (
        <p>
          Add <strong>{pricing.itemsToNext}</strong> more polo
          {pricing.itemsToNext > 1 ? "s" : ""} to unlock{" "}
          <strong>{pricing.nextRule.blurb}</strong>
        </p>
      ) : (
        <p>
          <strong>{count}</strong> polo{count === 1 ? "" : "s"} in cart — combo savings apply at
          checkout
        </p>
      )}
      <div className="shop-combo-banner-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress / 100})` }} />
      </div>
      <Link href="/checkout" className="shop-combo-banner-cta">
        Checkout
      </Link>
    </div>
  );
}
