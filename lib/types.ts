export type Platform = "instagram" | "facebook" | "tiktok" | "youtube" | "meta_ads" | "tiktok_ads";

export type PostStatus = "idea" | "in_progress" | "published";

export type WeeklyOrganicSummary = {
  weekLabel: string;
  views: number;
  subscribersDelta: number;
  hoursSpent: number;
};

export type WeeklyPaidSummary = {
  weekLabel: string;
  spendEur: number;
  clicks: number;
  conversions: number;
};

export type PlannerItem = {
  id: string;
  weekLabel: string;
  platform: Platform;
  theme: string;
  status: PostStatus;
  publishDate: string;
  timeSpentMinutes: number;
  views: number;
};

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "worker";
  active: boolean;
  profileImageUrl?: string;
  tempPassword?: string;
};
