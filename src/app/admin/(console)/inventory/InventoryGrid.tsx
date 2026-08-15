"use client";
import { useState } from "react";
import { SIZES, products } from "@/lib/products";
export function InventoryGrid({ initial }: { initial: Record<string, number> }) {
  const [values, setValues] = useState(initial);
  async function save(productSlug: string, size: string) { const key = `${productSlug}:${size}`; await fetch("/api/admin/inventory", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ productSlug, size, quantity: Number(values[key] ?? 0) }) }); }
  return <table className="admin-table admin-inventory"><thead><tr><th>Product</th>{SIZES.map((size) => <th key={size}>{size}</th>)}</tr></thead><tbody>{products.map((product) => <tr key={product.slug}><td>{product.name}</td>{SIZES.map((size) => { const key = `${product.slug}:${size}`; return <td key={size}><input aria-label={`${product.name} ${size}`} type="number" min="0" value={values[key] ?? 0} onChange={(e) => setValues({ ...values, [key]: Number(e.target.value) })} onBlur={() => save(product.slug, size)} /></td>; })}</tr>)}</tbody></table>;
}
