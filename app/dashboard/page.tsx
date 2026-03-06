import { redirect } from "next/navigation";
import { hasActiveSession } from "@/lib/auth";
import { LogoutButton } from "./logout-button";

export default async function DashboardPage() {
  const isLoggedIn = await hasActiveSession();

  if (!isLoggedIn) {
    redirect("/login");
  }

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div className="brand">VH SMM Tracker</div>
        <LogoutButton />
      </header>
      <section className="dashboard-body">
        <h1>Dashboard</h1>
        <p>Stage 1 baseline is live. Next we add weekly planner and paid traffic tabs.</p>
      </section>
    </main>
  );
}

