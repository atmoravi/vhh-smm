import { NextResponse } from "next/server";
import { hasActiveSession, getSessionRole, getSessionUserId, hasAdminAccess } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/security";
import { createUserSchema } from "@/lib/validators";

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

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      profileImageUrl: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const guard = await ensureAdmin();
  if (guard) {
    return guard;
  }

  const payload = await request.json();
  const parsed = createUserSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const normalizedEmail = data.email.toLowerCase();
  const passwordHash = await hashPassword(data.password);
  const createdById = await getSessionUserId();

  try {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: normalizedEmail,
        role: data.role,
        passwordHash,
        isActive: data.isActive,
        profileImageUrl: data.profileImageUrl,
        createdById,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        profileImageUrl: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create user";
    if (message.includes("Unique constraint")) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

