import { type RoadmapWeekStatus } from "@/features/classes/types/roadmapTypes";
import { formatDateRange } from "@/features/classes/utils/classFormat";

export const WEEK_STATUS_LABELS: Record<RoadmapWeekStatus, string> = {
  PAST: "Đã qua",
  CURRENT: "Tuần này",
  UPCOMING: "Sắp tới",
};

export function formatWeekRange(window: { startDate: string; endDate: string }): string {
  return formatDateRange(window.startDate, window.endDate);
}
