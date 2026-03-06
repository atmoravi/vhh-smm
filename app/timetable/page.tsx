import { AppShell } from "@/components/app-shell";
import { TimetableTracker } from "@/components/timetable-tracker";
import { requireSession } from "@/lib/auth";

export default async function TimetablePage() {
  const { role, userName, userId } = await requireSession();

  return (
    <AppShell activePath="/timetable" role={role} userName={userName} title="Timetable">
      <TimetableTracker role={role} userId={userId} />
    </AppShell>
  );
}

