import { NextResponse } from "next/server";
import { hasActiveSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createTimeEntrySchema } from "@/lib/validators";

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

  const entries = await prisma.timeEntry.findMany({
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

  const payload = await request.json();
  const parsed = createTimeEntrySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const entry = await prisma.timeEntry.create({ data: parsed.data });
    return NextResponse.json({ entry }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create time entry" }, { status: 500 });
  }
}

