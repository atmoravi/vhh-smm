import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, AUTH_ROLE_COOKIE_NAME, AUTH_USER_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    maxAge: 0,
    path: "/",
  });
  response.cookies.set({
    name: AUTH_ROLE_COOKIE_NAME,
    value: "",
    maxAge: 0,
    path: "/",
  });
  response.cookies.set({
    name: AUTH_USER_COOKIE_NAME,
    value: "",
    maxAge: 0,
    path: "/",
  });
  return response;
}
