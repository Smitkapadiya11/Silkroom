"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatInr } from "@/lib/pricing";
import { site } from "@/lib/site";

type StoredOrder = {
  items: { name: string; quantity: number; size: string; color: string }[];
  pricing: { total: number };
};

export default function OrderConfirmedPage() {
  const [order, setOrder] = useState<StoredOrder | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("silk-last-order");
      if (raw) setOrder(JSON.parse(raw) as StoredOrder);
    } catch {
      setOrder(null);
    }
  }, []);

  return (
    <article className="policy-page order-confirmed">
      <header className="store-page-header">
        <p className="eyebrow">Order sent</p>
        <h1>We&apos;ll reply on WhatsApp</h1>
      </header>

      <ol className="policy-list">
        <li>
          We typically confirm within a few hours during {site.responseHours}.
        </li>
        <li>We&apos;ll verify stock and your pincode, then dispatch from Surat.</li>
        <li>Once shipped, tracking goes to the same WhatsApp thread.</li>
      </ol>

      {order ? (
        <div className="order-summary">
          <p>
            <strong>Total:</strong> {formatInr(order.pricing.total)}
          </p>
          <ul>
            {order.items.map((item) => (
              <li key={`${item.name}-${item.size}`}>
                {item.name} · {item.color} · {item.size} × {item.quantity}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Link href="/shop" className="button button-primary">
        Continue shopping
      </Link>
    </article>
  );
}
