"use client";

import Link from "next/link";
import { useState } from "react";
import { formatInr } from "@/lib/pricing";

type LookupResult = {
  orderNumber: string;
  status: string;
  paymentMethod: string;
  totalInr: number;
  city: string;
};

export function OrderTrackingForm() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<LookupResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const params = new URLSearchParams({ orderNumber, phone });
      const response = await fetch(`/api/orders/lookup?${params}`);
      const data = (await response.json()) as LookupResult & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Lookup failed.");
      setResult(data);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Lookup failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <form className="checkout-form" onSubmit={onSubmit}>
        <label><span>Order number</span><input value={orderNumber} onChange={(event) => setOrderNumber(event.target.value.toUpperCase())} placeholder="SR-26-0001" required /></label>
        <label><span>Phone</span><input value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" placeholder="10-digit mobile" required /></label>
        <button type="submit" className="v2-button v2-button--ink" disabled={busy}>{busy ? "Looking up…" : "Track order"}</button>
      </form>
      {error ? <p className="is-flame">{error}</p> : null}
      {result ? <section className="order-summary"><p><strong><Link href={`/order/${result.orderNumber}`}>{result.orderNumber}</Link></strong></p><p>{result.status.replace("_", " ")} · {formatInr(result.totalInr)}</p><p>{result.city}</p></section> : null}
    </>
  );
}
