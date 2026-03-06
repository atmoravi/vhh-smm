import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  AUTH_ROLE_COOKIE_NAME,
  AUTH_USER_ID_COOKIE_NAME,
  AUTH_USER_COOKIE_NAME,
  UserRole,
  isValidAdminCredentials,
} from "@/lib/auth";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/security";

type LoginPayload = {
  login?: string;
  password?: string;
};

function setSessionCookies(response: NextResponse, data: { role: UserRole; userName: string; userId: string }) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "active",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  response.cookies.set({
    name: AUTH_ROLE_COOKIE_NAME,
    value: data.role,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  response.cookies.set({
    name: AUTH_USER_COOKIE_NAME,
    value: data.userName,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  response.cookies.set({
    name: AUTH_USER_ID_COOKIE_NAME,
    value: data.userId,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

function dbRoleToSessionRole(role: "ADMIN" | "OWNER" | "MANAGER" | "WORKER"): UserRole {
  if (role === "ADMIN") return "admin";
  if (role === "OWNER") return "owner";
  if (role === "MANAGER") return "manager";
  return "worker";
}

export async function POST(request: Request) {
  const payload = (await request.json()) as LoginPayload;
  const login = payload.login?.trim() ?? "";
  const password = payload.password ?? "";

  if (!login || !password) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isValidAdminCredentials(login, password)) {
    const response = NextResponse.json({ ok: true, source: "bootstrap-admin" });
    setSessionCookies(response, {
      role: "admin",
      userName: login,
      userId: "bootstrap-admin",
    });
    return response;
  }

  try {
    const normalized = login.toLowerCase();
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalized }, { name: { equals: login, mode: "insensitive" } }],
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const validPassword = await verifyPassword(password, user.passwordHash);
    if (!validPassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = dbRoleToSessionRole(user.role);
    const response = NextResponse.json({ ok: true, source: "database" });
    setSessionCookies(response, {
      role,
      userName: user.name,
      userId: user.id,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Login unavailable. Check database connection." }, { status: 503 });
  }
}
