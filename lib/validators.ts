import { z } from "zod";

export const userRoleSchema = z.enum(["ADMIN", "OWNER", "MANAGER", "WORKER"]);

export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  role: userRoleSchema.default("WORKER"),
  password: z.string().min(8).max(120),
  isActive: z.boolean().default(true),
  profileImageUrl: z
    .string()
    .max(2_000_000)
    .refine((value) => value.startsWith("data:image/") || /^https?:\/\//.test(value), {
      message: "Profile image must be a URL or image data URI",
    })
    .optional(),
});

export const createWeekSchema = z.object({
  label: z.string().trim().min(4).max(20),
  weekStartDate: z.coerce.date(),
  weekEndDate: z.coerce.date(),
});

export const createTimeEntrySchema = z.object({
  userId: z.string().min(1).optional(),
  weekId: z.string().min(1).optional(),
  activityType: z.enum([
    "CONTENT_PLANNING",
    "CONTENT_CREATION",
    "EDITING",
    "COMMUNITY_MANAGEMENT",
    "REPORTING",
    "MEETING",
    "OTHER",
  ]),
  workDate: z.coerce.date(),
  minutesSpent: z.number().int().min(1).max(24 * 60),
  notes: z.string().max(1000).optional(),
  linkedPostId: z.string().optional(),
});

export const createOrganicPostSchema = z.object({
  weekId: z.string().min(1),
  ownerUserId: z.string().optional(),
  platform: z.enum(["INSTAGRAM", "FACEBOOK", "TIKTOK", "YOUTUBE"]),
  title: z.string().max(160).optional(),
  theme: z.string().trim().min(2).max(255),
  status: z.enum(["IDEA", "IN_PROGRESS", "PUBLISHED"]).default("IDEA"),
  publishDate: z.coerce.date().optional(),
  timeSpentMinutes: z.number().int().min(0).max(24 * 60).default(0),
  views: z.number().int().min(0).default(0),
  likes: z.number().int().min(0).default(0),
  comments: z.number().int().min(0).default(0),
  shares: z.number().int().min(0).default(0),
  saves: z.number().int().min(0).default(0),
  profileVisits: z.number().int().min(0).default(0),
  followersDelta: z.number().int().default(0),
});

export const createPaidMetricSchema = z.object({
  weekId: z.string().min(1),
  platform: z.enum(["META_ADS", "TIKTOK_ADS"]),
  spendEur: z.number().nonnegative(),
  impressions: z.number().int().nonnegative().default(0),
  clicks: z.number().int().nonnegative().default(0),
  ctr: z.number().nonnegative().optional(),
  cpc: z.number().nonnegative().optional(),
  cpm: z.number().nonnegative().optional(),
  conversions: z.number().int().nonnegative().default(0),
  leads: z.number().int().nonnegative().default(0),
  revenueEur: z.number().nonnegative().optional(),
});
