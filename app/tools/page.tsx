import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ToolsUserManager } from "@/components/tools-user-manager";
import { requireSession } from "@/lib/auth";

export default async function ToolsPage() {
  const { role, userName } = await requireSession();
  if (role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <AppShell activePath="/tools" role={role} userName={userName} title="Tools">
      <ToolsUserManager />
    </AppShell>
  );
}

