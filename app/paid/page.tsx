import { AppShell } from "@/components/app-shell";
import { weeklyPaid } from "@/lib/mock-data";
import { requireSession } from "@/lib/auth";

export default async function PaidTrafficPage() {
  const { role, userName } = await requireSession();

  return (
    <AppShell activePath="/paid" role={role} userName={userName} title="Paid Traffic">
      <section className="panel">
        <h2>Weekly Paid Performance (Manual Input Baseline)</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Week</th>
              <th>Spend (EUR)</th>
              <th>Clicks</th>
              <th>Conversions</th>
              <th>Clicks / EUR</th>
            </tr>
          </thead>
          <tbody>
            {weeklyPaid.map((row) => (
              <tr key={row.weekLabel}>
                <td>{row.weekLabel}</td>
                <td>{row.spendEur.toLocaleString()}</td>
                <td>{row.clicks.toLocaleString()}</td>
                <td>{row.conversions.toLocaleString()}</td>
                <td>{(row.clicks / row.spendEur).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AppShell>
  );
}
