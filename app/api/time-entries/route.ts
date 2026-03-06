import { NextResponse } from "next/server";
import { getSessionRole, getSessionUserId, hasActiveSession, hasAdminAccess } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createTimeEntrySchema } from "@/lib/validators";

function computeWeekRange(date: Date): { start: Date; end: Date; label: string } {
  const start = new Date(date);
  const day = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  const firstJan = new Date(Date.UTC(start.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((start.getTime() - firstJan.getTime()) / 86400000) + 1) / 7);
  const label = `${start.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;

  return { start, end, label };
}

async function ensureSession() {
  const active = await hasActiveSession();
  if (!active) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const guard = await ensureSession();
  if (guard) {
    return guard;
  }

  const role = (await getSessionRole()) ?? "worker";
  const sessionUserId = await getSessionUserId();

  const entries = await prisma.timeEntry.findMany({
    where: hasAdminAccess(role) ? undefined : { userId: sessionUserId ?? "__none__" },
    orderBy: [{ workDate: "desc" }, { createdAt: "desc" }],
    take: 500,
  });

  return NextResponse.json({ entries });
}

export async function POST(request: Request) {
  const guard = await ensureSession();
  if (guard) {
    return guard;
  }

  const role = (await getSessionRole()) ?? "worker";
  const sessionUserId = await getSessionUserId();

  const payload = await request.json();
  const parsed = createTimeEntrySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const targetUserId = hasAdminAccess(role) ? parsed.data.userId ?? sessionUserId : sessionUserId;
  if (!targetUserId) {
    return NextResponse.json({ error: "No user context in session" }, { status: 400 });
  }

  try {
    const workDate = parsed.data.workDate;
    const weekId = parsed.data.weekId;

    let resolvedWeekId = weekId;
    if (!resolvedWeekId) {
      const week = computeWeekRange(workDate);
      const upsertedWeek = await prisma.workWeek.upsert({
        where: { label: week.label },
        update: {
          weekStartDate: week.start,
          weekEndDate: week.end,
        },
        create: {
          label: week.label,
          weekStartDate: week.start,
          weekEndDate: week.end,
        },
      });
      resolvedWeekId = upsertedWeek.id;
    }

    const entry = await prisma.timeEntry.create({
      data: {
        userId: targetUserId,
        weekId: resolvedWeekId,
        activityType: parsed.data.activityType,
        workDate,
        minutesSpent: parsed.data.minutesSpent,
        notes: parsed.data.notes,
        linkedPostId: parsed.data.linkedPostId,
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create time entry" }, { status: 500 });
  }
}

