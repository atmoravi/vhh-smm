import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const envSource = process.env.DATABASE_URL
    ? "DATABASE_URL"
    : process.env.vhsmm_PRISMA_DATABASE_URL
      ? "vhsmm_PRISMA_DATABASE_URL"
      : process.env.vhsmm_DATABASE_URL
        ? "vhsmm_DATABASE_URL"
        : process.env.vhsmm_POSTGRES_URL
          ? "vhsmm_POSTGRES_URL"
          : "none";

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, database: "connected", envSource });
  } catch {
    return NextResponse.json({ ok: false, database: "disconnected", envSource }, { status: 503 });
  }
}
