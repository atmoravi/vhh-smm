import { NextResponse } from "next/server";
import { hasActiveSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createOrganicPostSchema } from "@/lib/validators";

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

  const posts = await prisma.organicPost.findMany({
    orderBy: [{ publishDate: "desc" }, { createdAt: "desc" }],
    take: 500,
  });

  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const guard = await ensureSession();
  if (guard) {
    return guard;
  }

  const payload = await request.json();
  const parsed = createOrganicPostSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const post = await prisma.organicPost.create({ data: parsed.data });
    return NextResponse.json({ post }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create organic post" }, { status: 500 });
  }
}

