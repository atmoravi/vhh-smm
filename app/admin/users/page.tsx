import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { requireSession } from "@/lib/auth";
import { appUsers } from "@/lib/mock-data";

export default async function AdminUsersPage() {
  const { role } = await requireSession();
  if (role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <AppShell activePath="/admin/users" role={role} title="Users">
      <section className="panel">
        <h2>User Management (Boilerplate)</h2>
        <p>
          Stage 2 will connect this page to a real database and secure user creation flow. For now,
          this table shows mock data and target structure.
        </p>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {appUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.active ? "active" : "inactive"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AppShell>
  );
}

