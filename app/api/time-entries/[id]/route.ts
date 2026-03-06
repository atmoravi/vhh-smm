import { NextResponse } from "next/server";
import { getSessionRole, getSessionUserId, hasActiveSession, hasAdminAccess } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const active = await hasActiveSession();
  if (!active) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const role = (await getSessionRole()) ?? "worker";
  const sessionUserId = await getSessionUserId();

  const target = await prisma.timeEntry.findUnique({
    where: { id },
    select: { id: true, userId: true },
  });

  if (!target) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!hasAdminAccess(role) && target.userId !== sessionUserId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.timeEntry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

