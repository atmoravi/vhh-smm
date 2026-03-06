import { AppShell } from "@/components/app-shell";
import { requireSession } from "@/lib/auth";
import { weeklyOrganic, weeklyPaid } from "@/lib/mock-data";

export default async function DashboardPage() {
  const { role, userName } = await requireSession();
  const latestOrganic = weeklyOrganic[weeklyOrganic.length - 1];
  const latestPaid = weeklyPaid[weeklyPaid.length - 1];
  const organicPerHour = Math.round(latestOrganic.views / latestOrganic.hoursSpent);
  const paidPerEur = Number((latestPaid.clicks / latestPaid.spendEur).toFixed(2));

  return (
    <AppShell activePath="/dashboard" role={role} userName={userName} title="Dashboard">
      <div className="kpi-grid">
        <article className="kpi-card">
          <p className="kpi-label">Organic Views (Latest Week)</p>
          <p className="kpi-value">{latestOrganic.views.toLocaleString()}</p>
        </article>
        <article className="kpi-card">
          <p className="kpi-label">Subscriber Growth (Latest Week)</p>
          <p className="kpi-value">+{latestOrganic.subscribersDelta}</p>
        </article>
        <article className="kpi-card">
          <p className="kpi-label">Organic Views / Work Hour</p>
          <p className="kpi-value">{organicPerHour}</p>
        </article>
        <article className="kpi-card">
          <p className="kpi-label">Paid Clicks / EUR</p>
          <p className="kpi-value">{paidPerEur}</p>
        </article>
      </div>

      <section className="panel">
        <h2>Boilerplate Status</h2>
        <p>
          This baseline now has shared tabs, role-aware navigation, and module placeholders for
          Weekly Planner, Paid Traffic, and Admin Users.
        </p>
      </section>
    </AppShell>
  );
}
