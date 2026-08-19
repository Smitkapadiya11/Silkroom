"use client";

import { useEffect } from "react";
import { metaContents, trackMeta } from "@/lib/meta-pixel";

const KEY = "silk-meta-purchase";

export function MetaPurchase({
  orderNumber,
  value,
  items,
}: {
  orderNumber: string;
  value: number;
  items: { slug: string; quantity: number; price: number }[];
}) {
  useEffect(() => {
    try {
      const seen = window.sessionStorage.getItem(`${KEY}:${orderNumber}`);
      if (seen) return;
      window.sessionStorage.setItem(`${KEY}:${orderNumber}`, "1");
    } catch {
      return;
    }
    trackMeta("Purchase", {
      value,
      currency: "INR",
      content_ids: items.map((item) => item.slug),
      contents: metaContents(items),
      num_items: items.reduce((sum, item) => sum + item.quantity, 0),
      order_id: orderNumber,
    });
  }, [items, orderNumber, value]);

  return null;
}
