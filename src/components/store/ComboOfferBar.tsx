"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getBestOfferCopy } from "@/lib/pricing";

export function ComboOfferBar() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(sessionStorage.getItem("silk-combo-bar-dismissed") === "1");
  }, []);

  if (dismissed) return null;

  return (
    <div className="combo-offer-bar" role="region" aria-label="Current offer">
      <p>
        <Link href="/combos">{getBestOfferCopy()}</Link>
      </p>
      <button
        type="button"
        className="combo-offer-dismiss"
        aria-label="Dismiss offer bar"
        onClick={() => {
          sessionStorage.setItem("silk-combo-bar-dismissed", "1");
          setDismissed(true);
        }}
      >
        ×
      </button>
    </div>
  );
}
