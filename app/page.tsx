import { redirect } from "next/navigation";
import { hasActiveSession } from "@/lib/auth";

export default async function HomePage() {
  const isLoggedIn = await hasActiveSession();
  redirect(isLoggedIn ? "/dashboard" : "/login");
}

