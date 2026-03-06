import { AppShell } from "@/components/app-shell";
import { plannerItems } from "@/lib/mock-data";
import { requireSession } from "@/lib/auth";

export default async function PlannerPage() {
  const { role } = await requireSession();

  return (
    <AppShell activePath="/planner" role={role} title="Weekly Planner">
      <section className="panel">
        <h2>Current Week Posts</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Platform</th>
              <th>Theme</th>
              <th>Status</th>
              <th>Publish Date</th>
              <th>Time Spent</th>
              <th>Views</th>
            </tr>
          </thead>
          <tbody>
            {plannerItems.map((item) => (
              <tr key={item.id}>
                <td>{item.platform}</td>
                <td>{item.theme}</td>
                <td>{item.status}</td>
                <td>{item.publishDate}</td>
                <td>{item.timeSpentMinutes} min</td>
                <td>{item.views.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AppShell>
  );
}

