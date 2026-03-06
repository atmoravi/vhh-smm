import { NextResponse } from "next/server";
import { getSessionRole, getSessionUserId, hasActiveSession, hasAdminAccess } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { upsertWorkRateSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const active = await hasActiveSession();
  if (!active) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (await getSessionRole()) ?? "worker";
  const sessionUserId = await getSessionUserId();
  const { searchParams } = new URL(request.url);
  const requestedUserId = searchParams.get("userId");

  const targetUserId = hasAdminAccess(role)
    ? requestedUserId ?? sessionUserId
    : sessionUserId;

  if (!targetUserId) {
    return NextResponse.json({ error: "Missing user context" }, { status: 400 });
  }

  const rates = await (prisma as any).workRateSetting.findMany({
    where: { userId: targetUserId },
    orderBy: { activityType: "asc" },
  });

  const serialized = rates.map((rate: { id: string; userId: string; activityType: string; hourlyRateEur: number }) => ({
    id: rate.id,
    userId: rate.userId,
    activityType: rate.activityType,
    hourlyRateEur: Number(rate.hourlyRateEur),
  }));

  return NextResponse.json({ rates: serialized, userId: targetUserId });
}

export async function POST(request: Request) {
  const active = await hasActiveSession();
  if (!active) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (await getSessionRole()) ?? "worker";
  if (!hasAdminAccess(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = await request.json();
  const parsed = upsertWorkRateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const result = await (prisma as any).workRateSetting.upsert({
    where: {
      userId_activityType: {
        userId: data.userId,
        activityType: data.activityType,
      },
    },
    update: {
      hourlyRateEur: data.hourlyRateEur,
    },
    create: {
      userId: data.userId,
      activityType: data.activityType,
      hourlyRateEur: data.hourlyRateEur,
    },
  });

  return NextResponse.json({
    rate: {
      id: result.id,
      userId: result.userId,
      activityType: result.activityType,
      hourlyRateEur: Number(result.hourlyRateEur),
    },
  });
}
