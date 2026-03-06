import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";

export default async function AdminUsersPage() {
  const { role } = await requireSession();
  if (role !== "admin") {
    redirect("/dashboard");
  }
  redirect("/tools");
}
