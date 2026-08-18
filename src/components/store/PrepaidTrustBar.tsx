import Link from "next/link";
import { site } from "@/lib/site";

const items = [
  {
    href: "/checkout/payment",
    label: "256-bit encrypted checkout",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="trust-icon">
        <path
          d="M12 3 5 6v6c0 4.2 3 7.9 7 9 4-1.1 7-4.8 7-9V6l-7-3Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M9.5 12 11 13.5 14.5 10" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
    ),
  },
  {
    href: "/how-to-order",
    label: "UPI · Cards · Netbanking",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="trust-icon">
        <rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    href: "/guarantee",
    label: `${site.exchangeWindowDays}-day size exchange`,
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="trust-icon">
        <path d="M7 7h10v10H7z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 12h6M12 9v6" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    href: "/shipping-returns",
    label: "Packed & shipped from Surat",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="trust-icon">
        <path d="M3 12h18M6 16h12M9 8h6" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
    ),
  },
] as const;

export function PrepaidTrustBar({ className = "" }: { className?: string }) {
  return (
    <div className={`prepaid-trust-bar ${className}`.trim()} aria-label="Secure checkout promises">
      <ul>
        {items.map((item) => (
          <li key={item.label}>
            <Link href={item.href} className="prepaid-trust-link">
              {item.icon}
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
