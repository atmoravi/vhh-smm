import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, isValidAdminCredentials } from "@/lib/auth";

type LoginPayload = {
  login?: string;
  password?: string;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as LoginPayload;
  const login = payload.login?.trim() ?? "";
  const password = payload.password ?? "";

  if (!isValidAdminCredentials(login, password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "active",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}

