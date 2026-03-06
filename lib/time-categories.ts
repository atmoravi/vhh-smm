export type TimeCategoryValue =
  | "CONTENT_CREATION"
  | "COMMUNITY_MANAGEMENT"
  | "CONTENT_PLANNING"
  | "REPORTING"
  | "MEETING"
  | "OTHER"
  | "EDITING";

export type TimeCategoryOption = {
  value: TimeCategoryValue;
  label: string;
};

export const TIME_CATEGORY_OPTIONS: TimeCategoryOption[] = [
  { value: "CONTENT_CREATION", label: "Content Creation" },
  { value: "COMMUNITY_MANAGEMENT", label: "Engagement/Community Mgmt" },
  { value: "CONTENT_PLANNING", label: "Strategy & Planning" },
  { value: "REPORTING", label: "Analytics & Reporting" },
  { value: "EDITING", label: "Ad Management" },
  { value: "MEETING", label: "Client Meetings" },
  { value: "OTHER", label: "Admin/Misc" },
];

export function getTimeCategoryLabel(value: string): string {
  return TIME_CATEGORY_OPTIONS.find((item) => item.value === value)?.label ?? value;
}

