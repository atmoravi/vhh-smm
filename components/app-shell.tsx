import Link from "next/link";
import { hasAdminAccess, UserRole } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { ProfileMenu } from "@/components/profile-menu";

type TabConfig = {
  href: string;
  label: string;
  adminOnly?: boolean;
};

const TABS: TabConfig[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/planner", label: "Weekly Planner" },
  { href: "/timetable", label: "Timetable" },
  { href: "/paid", label: "Paid Traffic" },
  { href: "/tools", label: "Tools", adminOnly: true },
];

type AppShellProps = {
  activePath: string;
  role: UserRole;
  userName: string;
  title: string;
  children: React.ReactNode;
};

export function AppShell({ activePath, role, userName, title, children }: AppShellProps) {
  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div className="brand">VH SMM Tracker</div>
        <div className="topbar-actions">
          <ProfileMenu userName={userName} role={role} />
          <LogoutButton />
        </div>
      </header>

      <nav className="tabs-nav">
        {TABS.filter((tab) => !tab.adminOnly || hasAdminAccess(role)).map((tab) => (
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
