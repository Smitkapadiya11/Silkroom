import Link from "next/link";
import { site } from "@/lib/site";

function TrustIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="trust-icon">
      {children}
    </svg>
  );
}

const items = [
  {
    href: "/checkout/payment",
    label: "Secure prepaid checkout",
    icon: (
      <TrustIcon>
        <path
          d="M12 3 5 6v6c0 4.2 3 7.9 7 9 4-1.1 7-4.8 7-9V6l-7-3Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </TrustIcon>
    ),
  },
  {
    href: "/guarantee",
    label: `Easy ${site.exchangeWindowDays}-day exchange`,
    icon: (
      <TrustIcon>
        <path d="M7 7h10v10H7z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 12h6M12 9v6" stroke="currentColor" strokeWidth="1.5" />
      </TrustIcon>
    ),
  },
  {
    href: "/shipping-returns",
    label: "Delivered across India",
    icon: (
      <TrustIcon>
        <path d="M3 12h18M6 16h12M9 8h6" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </TrustIcon>
    ),
  },
  {
    href: "/about",
    label: "Made in India",
    icon: (
      <TrustIcon>
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.5" />
      </TrustIcon>
    ),
  },
];

export function TrustStrip({ className = "" }: { className?: string }) {
  return (
    <div className={`trust-strip ${className}`.trim()} aria-label="Store policies">
      <ul>
        {items.map((item) => (
          <li key={item.label}>
            <Link href={item.href} className="trust-strip-link">
              {item.icon}
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
