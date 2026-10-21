import { type ClassRoadmapWeek, type RoadmapWeekStatus } from "@/features/classes/types/roadmapTypes";
import { formatDateRange } from "@/features/classes/utils/classFormat";

export const WEEK_STATUS_LABELS: Record<RoadmapWeekStatus, string> = {
  PAST: "Đã qua",
  CURRENT: "Tuần này",
  UPCOMING: "Sắp tới",
};

export function formatWeekRange(window: { startDate: string; endDate: string }): string {
  return formatDateRange(window.startDate, window.endDate);
}

export interface RoadmapExerciseRow {
  key: string;
  weekNumber: number;
  title: string;
  isAvailable: boolean;
  status: RoadmapWeekStatus;
}

// One row per finger exercise attached to a week, in week order.
export function buildExerciseRows(weeks: ClassRoadmapWeek[]): RoadmapExerciseRow[] {
  return weeks.flatMap((week) =>
    week.exercises.map((exercise) => ({
      key: `${week.weekNumber}-${exercise.pieceId}`,
      weekNumber: week.weekNumber,
      title: exercise.title,
      isAvailable: exercise.isAvailable,
      status: week.status,
    }))
  );
}
