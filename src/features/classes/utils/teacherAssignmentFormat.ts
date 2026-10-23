import {
  type AssignmentKind,
  type AssignmentStatus,
  type StudentAssignmentStatus,
  type SubmissionStatus,
} from "@/features/classes/types/teacherAssignmentTypes";

// A piece has several sheets (per instrument / level), so the piece title alone is ambiguous.
export function sheetMusicLabel(sheet: { pieceTitle: string; name: string }): string {
  return `${sheet.pieceTitle} — ${sheet.name}`;
}

export const ASSIGNMENT_KIND_LABELS: Record<AssignmentKind, string> = {
  SOLO: "Độc tấu",
  ENSEMBLE: "Hòa tấu",
  BONUS: "Bonus",
  OTHER: "Bài tập khác",
};

export const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  DRAFT: "Nháp",
  PUBLISHED: "Đã đăng",
  CLOSED: "Đã đóng",
};

export const STUDENT_STATUS_LABELS: Record<StudentAssignmentStatus, string> = {
  NOT_SUBMITTED: "Chưa nộp",
  SUBMITTED: "Đã nộp",
  PASSED: "Đạt",
};

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  PROCESSING: "Đang xử lý",
  COMPLETED: "Hoàn tất",
  REJECTED: "Từ chối",
  FAILED: "Lỗi xử lý",
};

// Timestamps are UTC; they are always shown in Asia/Ho_Chi_Minh, whatever the browser time zone.
export function formatVietnamDateTime(isoTimestamp: string, withYear = true): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date(isoTimestamp))
      .map((part) => [part.type, part.value])
  );
  const date = withYear ? `${parts.day}/${parts.month}/${parts.year}` : `${parts.day}/${parts.month}`;
  return `${date} ${parts.hour}:${parts.minute}`;
}

// At most one decimal, truncated so it never crosses the threshold (69.6 stays 69.6, not 70).
export function formatPercent(value: number): string {
  return `${Number.isInteger(value) ? value : Math.floor(value * 10) / 10}%`;
}

export function formatStudentSummary(student: {
  submissionCount: number;
  lastSubmittedAt: string | null;
  bestAccuracy: number | null;
}): string {
  if (student.submissionCount === 0 || !student.lastSubmittedAt) return "Chưa có lần nộp";
  const parts = [
    `${student.submissionCount} lần nộp`,
    `gần nhất ${formatVietnamDateTime(student.lastSubmittedAt, false)}`,
  ];
  if (student.bestAccuracy !== null) parts.push(`cao nhất ${formatPercent(student.bestAccuracy)}`);
  return parts.join(" · ");
}
