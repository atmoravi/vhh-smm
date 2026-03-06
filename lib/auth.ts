import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const AUTH_COOKIE_NAME = "vh_smm_admin_session";
export const AUTH_ROLE_COOKIE_NAME = "vh_smm_role";
export const AUTH_USER_COOKIE_NAME = "vh_smm_user";
export const AUTH_USER_ID_COOKIE_NAME = "vh_smm_user_id";
export type UserRole = "admin" | "owner" | "manager" | "worker";

// Hardcoded only for Stage 1 validation. Replace with database auth in Stage 2.
const ADMIN_LOGIN = "vhadmin";
const ADMIN_PASSWORD = "Melone#2020#vhsmm";

export function isValidAdminCredentials(login: string, password: string): boolean {
  return login === ADMIN_LOGIN && password === ADMIN_PASSWORD;
}

export async function hasActiveSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value === "active";
}

export async function getSessionRole(): Promise<UserRole | null> {
  const cookieStore = await cookies();
  const role = cookieStore.get(AUTH_ROLE_COOKIE_NAME)?.value;
  if (role === "admin" || role === "owner" || role === "manager" || role === "worker") {
    return role;
  }
  return null;
}

export async function getSessionUserName(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_USER_COOKIE_NAME)?.value ?? "User";
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_USER_ID_COOKIE_NAME)?.value ?? null;
}

export async function requireSession(): Promise<{ role: UserRole; userName: string; userId: string | null }> {
  const isLoggedIn = await hasActiveSession();
  if (!isLoggedIn) {
    redirect("/login");
  }

  const role = await getSessionRole();
  const userName = await getSessionUserName();
  const userId = await getSessionUserId();
  return { role: role ?? "worker", userName, userId };
}

export function hasAdminAccess(role: UserRole): boolean {
  return role === "admin" || role === "owner";
}

export async function requireAdminSession() {
  const session = await requireSession();
  if (!hasAdminAccess(session.role)) {
    redirect("/dashboard");
  }
  return session;
}
