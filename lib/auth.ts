import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const AUTH_COOKIE_NAME = "vh_smm_admin_session";
export const AUTH_ROLE_COOKIE_NAME = "vh_smm_role";
export type UserRole = "admin" | "worker";

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
  if (role === "admin" || role === "worker") {
    return role;
  }
  return null;
}

export async function requireSession(): Promise<{ role: UserRole }> {
  const isLoggedIn = await hasActiveSession();
  if (!isLoggedIn) {
    redirect("/login");
  }

  const role = await getSessionRole();
  return { role: role ?? "worker" };
}

