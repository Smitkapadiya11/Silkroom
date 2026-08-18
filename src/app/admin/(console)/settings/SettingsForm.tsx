"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function SettingsForm({
  settings,
}: {
  settings: Record<string, string | number | boolean | Date | null>;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(false);
    setError(null);
    setSaving(true);

    try {
      const data: Record<string, unknown> = Object.fromEntries(
        new FormData(event.currentTarget),
      );
      for (const key of [
        "combo3PriceInr",
        "combo5PriceInr",
        "unitPriceInr",
        "prepaidDiscountInr",
        "freeDeliveryThresholdInr",
        "packageWeightGrams",
        "packageLengthCm",
        "packageWidthCm",
        "packageHeightCm",
      ]) {
        data[key] = Number(data[key]);
      }
      data.announcementEnabled = data.announcementEnabled === "on";

      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `Save failed (${response.status})`);
      }

      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  const input = (key: string, label: string, type = "text") => (
    <label key={key}>
      {label}
      <input type={type} name={key} defaultValue={String(settings[key] ?? "")} required={type === "email"} />
    </label>
  );

  return (
    <form className="admin-form" onSubmit={submit}>
      {input("contactEmail", "Contact email", "email")}
      {input("contactPhone", "Contact phone")}
      {input("returnAddress", "Return address")}
      {input("responseHours", "Response hours")}
      {input("combo3PriceInr", "3-piece price", "number")}
      {input("combo5PriceInr", "5-piece price", "number")}
      {input("unitPriceInr", "Unit price", "number")}
      <label>
        <input
          type="checkbox"
          name="announcementEnabled"
          defaultChecked={Boolean(settings.announcementEnabled)}
        />{" "}
        Show announcement
      </label>
      <label style={{ flexBasis: "100%" }}>
        Announcement
        <textarea name="announcementText" defaultValue={String(settings.announcementText ?? "")} />
      </label>
      <button className="admin-button" type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save settings"}
      </button>
      {saved ? <span className="admin-success">Saved. Storefront contact details updated.</span> : null}
      {error ? <span className="admin-error">{error}</span> : null}
    </form>
  );
}
