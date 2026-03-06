import Link from "next/link";
import { UserRole } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

type TabConfig = {
  href: string;
  label: string;
  adminOnly?: boolean;
};

const TABS: TabConfig[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/planner", label: "Weekly Planner" },
  { href: "/paid", label: "Paid Traffic" },
  { href: "/admin/users", label: "Users", adminOnly: true },
];

type AppShellProps = {
  activePath: string;
  role: UserRole;
  title: string;
  children: React.ReactNode;
};

export function AppShell({ activePath, role, title, children }: AppShellProps) {
  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div className="brand">VH SMM Tracker</div>
        <LogoutButton />
      </header>

      <nav className="tabs-nav">
        {TABS.filter((tab) => !tab.adminOnly || role === "admin").map((tab) => (
          <Link
            key={tab.href}
            className={tab.href === activePath ? "tab-link active" : "tab-link"}
            href={tab.href}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <section className="dashboard-body">
        <h1>{title}</h1>
        {children}
      </section>
    </main>
  );
}

