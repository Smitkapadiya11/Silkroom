"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";

export type AdminOrderRow = {
  orderNumber: string;
  createdAt: string;
  customerName: string;
  city: string;
  itemCount: number;
  totalInr: number;
  paymentMethod: string;
  status: string;
  phoneMasked: string;
  courier: string | null;
  awbNumber: string | null;
};

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function OrdersTable({ rows }: { rows: AdminOrderRow[] }) {
  const router = useRouter();
  const search = useSearchParams();
  const [selected, setSelected] = useState<string[]>([]);

  const update = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(search.toString());
    Object.entries(patch).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    next.delete("page");
    router.push(`/admin/orders?${next.toString()}`);
  };

  const columns = useMemo<ColumnDef<AdminOrderRow>[]>(
    () => [
      {
        id: "select",
        header: "",
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selected.includes(row.original.orderNumber)}
            onChange={() => {
              setSelected((current) =>
                current.includes(row.original.orderNumber)
                  ? current.filter((value) => value !== row.original.orderNumber)
                  : [...current, row.original.orderNumber],
              );
            }}
          />
        ),
      },
      {
        header: "Order",
        cell: ({ row }) => (
          <Link href={`/admin/orders/${row.original.orderNumber}`}>{row.original.orderNumber}</Link>
        ),
      },
      { accessorKey: "customerName", header: "Customer" },
      { accessorKey: "phoneMasked", header: "Phone" },
      { accessorKey: "status", header: "Status" },
      {
        header: "Payment",
        cell: ({ row }) =>
          row.original.status === "awaiting_payment"
            ? "Prepaid · unpaid"
            : row.original.paymentMethod === "prepaid"
              ? "Prepaid"
              : "Unpaid · collect",
      },
      {
        header: "Total",
        cell: ({ row }) => money.format(row.original.totalInr),
      },
      { accessorKey: "city", header: "City" },
      { accessorKey: "awbNumber", header: "AWB" },
    ],
    [selected],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  async function bulk(action: string) {
    if (!selected.length) return;
    await fetch("/api/admin/orders/bulk", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, orderNumbers: selected }),
    });
    setSelected([]);
    router.refresh();
  }

  async function download(path: string) {
    if (!selected.length) return;
    const response = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ orderNumbers: selected }),
    });
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      window.alert(data?.error ?? "Could not download the file. Select paid orders and try again.");
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download =
      response.headers.get("Content-Disposition")?.split("filename=")?.[1]?.replaceAll('"', "") ||
      "silkroom-export.bin";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <form
        className="admin-filter"
        onSubmit={(event) => {
          event.preventDefault();
          update({ q: new FormData(event.currentTarget).get("q")?.toString() });
        }}
      >
        <input
          name="q"
          defaultValue={search.get("q") ?? ""}
          placeholder="Order, customer, email or phone"
        />
        <select
          defaultValue={search.get("status") ?? ""}
          onChange={(event) => update({ status: event.target.value || undefined })}
        >
          <option value="">All statuses</option>
          {["pending", "awaiting_payment", "confirmed", "packed", "dispatched", "delivered", "cancelled", "rto"].map(
            (status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ),
          )}
        </select>
        <select
          defaultValue={search.get("paymentMethod") ?? ""}
          onChange={(event) => update({ paymentMethod: event.target.value || undefined })}
        >
          <option value="">All payments</option>
          <option value="prepaid">Prepaid</option>
        </select>
        <button className="admin-button" type="submit">
          Filter
        </button>
      </form>
      <div className="admin-form" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button className="admin-button secondary" type="button" onClick={() => bulk("confirm")}>
          Confirm
        </button>
        <button className="admin-button secondary" type="button" onClick={() => bulk("pack")}>
          Pack
        </button>
        <button className="admin-button secondary" type="button" onClick={() => bulk("dispatch")}>
          Dispatch
        </button>
        <button className="admin-button secondary" type="button" onClick={() => download("/api/admin/labels")}>
          Labels PDF
        </button>
        <button
          className="admin-button secondary"
          type="button"
          onClick={() => download("/api/admin/packing-slips")}
        >
          Packing slips
        </button>
        <button className="admin-button secondary" type="button" onClick={() => download("/api/admin/export/csv")}>
          Shiprocket CSV
        </button>
      </div>
      <table className="admin-table">
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
