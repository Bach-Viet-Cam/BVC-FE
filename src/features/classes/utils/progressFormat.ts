import { type ProgressSortKey, type ProgressStatus, type ProgressStudent, type SortDirection } from "@/features/classes/types/teacherProgressTypes";
import { formatPercent, formatVietnamDateTime } from "@/features/classes/utils/teacherAssignmentFormat";

export const PROGRESS_STATUS_LABELS: Record<ProgressStatus, string> = {
  ON_TRACK: "Đúng tiến độ",
  AT_RISK: "Có nguy cơ",
  BEHIND: "Chậm tiến độ",
};

export const PROGRESS_STATUS_TONES: Record<ProgressStatus, "ok" | "warn" | "muted"> = {
  ON_TRACK: "ok",
  AT_RISK: "warn",
  BEHIND: "warn",
};

export function formatProgressSummary(student: ProgressStudent): string {
  if (student.average === null) return "Chưa có bài nộp được phân tích";
  const parts = [`TB ${formatPercent(student.average)}`, `${student.assignmentsWithSubmissions} bài`];
  if (student.lastSubmittedAt) parts.push(`gần nhất ${formatVietnamDateTime(student.lastSubmittedAt, false)}`);
  return parts.join(" · ");
}

const SORT_VALUE: Record<ProgressSortKey, (student: ProgressStudent) => string | number | null> = {
  name: (student) => student.fullName,
  code: (student) => student.studentCode,
  average: (student) => student.average,
  last: (student) => student.lastSubmittedAt,
};

// Missing values (no code, no data) always go last, whatever the direction.
export function sortProgressStudents(students: ProgressStudent[], key: ProgressSortKey, direction: SortDirection): ProgressStudent[] {
  const sign = direction === "asc" ? 1 : -1;
  return [...students].sort((first, second) => {
    const firstValue = SORT_VALUE[key](first);
    const secondValue = SORT_VALUE[key](second);
    if (firstValue === null && secondValue === null) return 0;
    if (firstValue === null) return 1;
    if (secondValue === null) return -1;
    if (typeof firstValue === "number" && typeof secondValue === "number") return (firstValue - secondValue) * sign;
    return String(firstValue).localeCompare(String(secondValue), "vi") * sign;
  });
}
