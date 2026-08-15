import Link from "next/link";
import { signOut } from "@/auth";

const links = [
  ["Overview", "/admin"],
  ["Orders", "/admin/orders"],
  ["Scan", "/admin/scan"],
  ["Customers", "/admin/customers"],
  ["Inventory", "/admin/inventory"],
  ["Settings", "/admin/settings"],
] as const;

export default function AdminConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/admin">
          Silk Room <small>v4</small>
        </Link>
        <nav>
          {links.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/admin/login" });
          }}
        >
          <button type="submit">Sign out</button>
        </form>
      </aside>
      <main className="admin-main">{children}</main>
      <nav className="admin-bottom-tabs">
        {links.slice(0, 5).map(([label, href]) => (
          <Link key={href} href={href}>
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
