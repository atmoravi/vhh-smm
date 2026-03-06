import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { WorkTimeSettingsManager } from "@/components/work-time-settings-manager";
import { hasAdminAccess, requireSession } from "@/lib/auth";

export default async function WorkTimeSettingsPage() {
  const { role, userName } = await requireSession();
  if (!hasAdminAccess(role)) {
    redirect("/dashboard");
  }

  return (
    <AppShell activePath="/work-time-settings" role={role} userName={userName} title="Work Time Settings">
      <WorkTimeSettingsManager />
    </AppShell>
  );
}

