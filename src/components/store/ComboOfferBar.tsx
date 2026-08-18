"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CLEAN_ANNOUNCEMENT, scrubCodCopy } from "@/lib/copy";

export function ComboOfferBar({ text }: { text?: string }) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem("silk-combo-bar-dismissed") === "1");
  }, []);

  if (dismissed) return null;

  return (
    <div className="combo-offer-bar" role="region" aria-label="Current offer">
      <p>
        <Link href="/shop">
          {scrubCodCopy(text ?? CLEAN_ANNOUNCEMENT)}
        </Link>
      </p>
      <button
        type="button"
        className="combo-offer-dismiss"
        aria-label="Dismiss offer bar"
        onClick={() => {
          localStorage.setItem("silk-combo-bar-dismissed", "1");
          setDismissed(true);
        }}
      >
        ×
      </button>
    </div>
  );
}
