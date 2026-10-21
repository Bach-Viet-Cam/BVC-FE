import { type AssignmentStudent } from "@/features/classes/types/teacherAssignmentTypes";
import { formatPercent, formatVietnamDateTime } from "@/features/classes/utils/teacherAssignmentFormat";

// Students who have submitted, most recent submission first.
export function buildReviewQueue(students: AssignmentStudent[]): AssignmentStudent[] {
  return students
    .filter((student) => student.submissionCount > 0)
    .sort((first, second) => (second.lastSubmittedAt ?? "").localeCompare(first.lastSubmittedAt ?? ""));
}

// "3 lần nộp · 21/10 09:07"
export function formatQueueSubtitle(student: AssignmentStudent): string {
  const parts = [`${student.submissionCount} lần nộp`];
  if (student.lastSubmittedAt) parts.push(formatVietnamDateTime(student.lastSubmittedAt, false));
  return parts.join(" · ");
}

export function formatQueueScore(student: AssignmentStudent): string {
  return student.bestAccuracy === null ? "—" : formatPercent(student.bestAccuracy);
}
