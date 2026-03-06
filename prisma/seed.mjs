import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL ?? "vhadmin@local";
  const adminName = process.env.BOOTSTRAP_ADMIN_NAME ?? "VH Admin";
  const adminPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD ?? "Melone#2020#vhsmm";

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      role: "ADMIN",
      passwordHash,
      isActive: true,
    },
    create: {
      email: adminEmail,
      name: adminName,
      role: "ADMIN",
      passwordHash,
      isActive: true,
    },
  });

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const label = `${weekStart.getUTCFullYear()}-W${String(
    Math.ceil((((weekStart - new Date(Date.UTC(weekStart.getUTCFullYear(), 0, 1))) / 86400000) + 1) / 7),
  ).padStart(2, "0")}`;

  await prisma.workWeek.upsert({
    where: { label },
    update: { weekStartDate: weekStart, weekEndDate: weekEnd },
    create: { label, weekStartDate: weekStart, weekEndDate: weekEnd },
  });

  console.log("Seed complete:", { adminEmail, label });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

