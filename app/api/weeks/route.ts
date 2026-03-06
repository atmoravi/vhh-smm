import { NextResponse } from "next/server";
import { hasActiveSession, getSessionRole, hasAdminAccess } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createWeekSchema } from "@/lib/validators";

async function ensureAdmin() {
  const active = await hasActiveSession();
  if (!active) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = (await getSessionRole()) ?? "worker";
  if (!hasAdminAccess(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function GET() {
  const guard = await ensureAdmin();
  if (guard) {
    return guard;
  }

  const weeks = await prisma.workWeek.findMany({
    orderBy: { weekStartDate: "desc" },
  });
  return NextResponse.json({ weeks });
}

export async function POST(request: Request) {
  const guard = await ensureAdmin();
  if (guard) {
    return guard;
  }

  const payload = await request.json();
  const parsed = createWeekSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const week = await prisma.workWeek.create({ data: parsed.data });
    return NextResponse.json({ week }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create week";
    if (message.includes("Unique constraint")) {
      return NextResponse.json({ error: "Week label already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create week" }, { status: 500 });
  }
}

