"use client";
import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
export default function ScanPage() {
  const router = useRouter(); const ref = useRef<HTMLInputElement>(null); const [last, setLast] = useState(""); const [message, setMessage] = useState("Scan an order barcode.");
  async function scan(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const value = ref.current?.value.trim().toUpperCase(); if (!value) return; if (value === last) { const response = await fetch(`/api/admin/orders/${value}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: "packed" }) }); setMessage(response.ok ? `${value} marked packed.` : "Unable to mark as packed."); } else { setLast(value); setMessage(`${value} found. Scan again to mark packed.`); router.prefetch(`/admin/orders/${value}`); } if (ref.current) { ref.current.value = ""; ref.current.focus(); } }
  return <section className="admin-page"><h1>Scan</h1><form onSubmit={scan}><input ref={ref} className="admin-scan" autoFocus inputMode="text" placeholder="Scan or enter order number" /><button className="admin-button">Process</button></form><p>{message}</p></section>;
}
