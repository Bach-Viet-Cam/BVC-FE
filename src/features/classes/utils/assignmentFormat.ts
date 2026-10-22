import { type StudentAssignmentStatus } from "@/features/classes/types/assignmentTypes";

type TagVariant = "ok" | "warn" | "muted" | "error" | "pending";

export const ASSIGNMENT_STATUS_META: Record<StudentAssignmentStatus, { label: string; variant: TagVariant }> = {
  PASSED: { label: "Đạt", variant: "ok" },
  SUBMITTED: { label: "Đã nộp", variant: "pending" },
  OVERDUE: { label: "Quá hạn", variant: "error" },
  NOT_SUBMITTED: { label: "Chưa nộp", variant: "muted" },
};

export const SUBMIT_BLOCKED_MESSAGE = "Bạn đã hết lượt nộp hoặc bài đã quá hạn.";

export function formatShortDeadline(isoDate: string): string {
  const date = new Date(isoDate);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatFullDeadline(isoDate: string): string {
  const date = new Date(isoDate);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} · ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function describeTimeLeft(isoDate: string, now: Date): string {
  const diffMs = new Date(isoDate).getTime() - now.getTime();
  if (diffMs < 0) return "Đã quá hạn";
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (days >= 1) return `còn ${days} ngày`;
  const hours = Math.max(1, Math.floor(diffMs / (60 * 60 * 1000)));
  return `còn ${hours} giờ`;
}
