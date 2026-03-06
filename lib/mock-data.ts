import { AppUser, PlannerItem, WeeklyOrganicSummary, WeeklyPaidSummary } from "@/lib/types";

export const weeklyOrganic: WeeklyOrganicSummary[] = [
  { weekLabel: "2026-W06", views: 28400, subscribersDelta: 116, hoursSpent: 22 },
  { weekLabel: "2026-W07", views: 30150, subscribersDelta: 143, hoursSpent: 24 },
  { weekLabel: "2026-W08", views: 35500, subscribersDelta: 171, hoursSpent: 26 },
  { weekLabel: "2026-W09", views: 40220, subscribersDelta: 209, hoursSpent: 28 },
];

export const weeklyPaid: WeeklyPaidSummary[] = [
  { weekLabel: "2026-W06", spendEur: 650, clicks: 1910, conversions: 71 },
  { weekLabel: "2026-W07", spendEur: 680, clicks: 2062, conversions: 77 },
  { weekLabel: "2026-W08", spendEur: 710, clicks: 2214, conversions: 83 },
  { weekLabel: "2026-W09", spendEur: 740, clicks: 2380, conversions: 89 },
];

export const plannerItems: PlannerItem[] = [
  {
    id: "p1",
    weekLabel: "2026-W10",
    platform: "instagram",
    theme: "Client success reel",
    status: "published",
    publishDate: "2026-03-02",
    timeSpentMinutes: 95,
    views: 6400,
  },
  {
    id: "p2",
    weekLabel: "2026-W10",
    platform: "tiktok",
    theme: "Behind-the-scenes edit workflow",
    status: "in_progress",
    publishDate: "2026-03-07",
    timeSpentMinutes: 110,
    views: 0,
  },
  {
    id: "p3",
    weekLabel: "2026-W10",
    platform: "youtube",
    theme: "Weekly recap short",
    status: "idea",
    publishDate: "2026-03-09",
    timeSpentMinutes: 40,
    views: 0,
  },
];

export const appUsers: AppUser[] = [
  { id: "u1", name: "VH Admin", email: "admin@vh.local", role: "admin", active: true },
  { id: "u2", name: "Content Worker 1", email: "worker1@vh.local", role: "worker", active: true },
];

