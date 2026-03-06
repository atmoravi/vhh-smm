import { NextResponse } from "next/server";
import { hasActiveSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createPaidMetricSchema } from "@/lib/validators";

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

  const metrics = await prisma.paidWeeklyMetric.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const serialized = metrics.map((item) => ({
    ...item,
    spendEur: Number(item.spendEur),
    ctr: item.ctr == null ? null : Number(item.ctr),
    cpc: item.cpc == null ? null : Number(item.cpc),
    cpm: item.cpm == null ? null : Number(item.cpm),
    revenueEur: item.revenueEur == null ? null : Number(item.revenueEur),
  }));

  return NextResponse.json({ metrics: serialized });
}

export async function POST(request: Request) {
  const guard = await ensureSession();
  if (guard) {
    return guard;
  }

  const payload = await request.json();
  const parsed = createPaidMetricSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const metric = await prisma.paidWeeklyMetric.upsert({
      where: {
        weekId_platform: {
          weekId: parsed.data.weekId,
          platform: parsed.data.platform,
        },
      },
      update: parsed.data,
      create: parsed.data,
    });

    return NextResponse.json(
      {
        metric: {
          ...metric,
          spendEur: Number(metric.spendEur),
          ctr: metric.ctr == null ? null : Number(metric.ctr),
          cpc: metric.cpc == null ? null : Number(metric.cpc),
          cpm: metric.cpm == null ? null : Number(metric.cpm),
          revenueEur: metric.revenueEur == null ? null : Number(metric.revenueEur),
        },
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: "Failed to save paid metric" }, { status: 500 });
  }
}

