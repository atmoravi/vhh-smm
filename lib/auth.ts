import { cookies } from "next/headers";

export const AUTH_COOKIE_NAME = "vh_smm_admin_session";

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

