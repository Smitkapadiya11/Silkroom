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
    label: "COD available",
    icon: (
      <TrustIcon>
        <path d="M4 7h16v10H4z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 11h8" stroke="currentColor" strokeWidth="1.5" />
      </TrustIcon>
    ),
  },
  {
    label: `Easy ${site.exchangeWindowDays}-day exchange`,
    icon: (
      <TrustIcon>
        <path d="M7 7h10v10H7z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 12h6M12 9v6" stroke="currentColor" strokeWidth="1.5" />
      </TrustIcon>
    ),
  },
  {
    label: "Delivered across India",
    icon: (
      <TrustIcon>
        <path d="M3 12h18M6 16h12M9 8h6" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </TrustIcon>
    ),
  },
  {
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
            {item.icon}
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
