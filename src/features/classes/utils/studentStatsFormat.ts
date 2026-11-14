import type { StudentStats, StudentStatsAssignment, StudentStatsAttempt } from "@/features/practice/types/studentStatsTypes";

export function buildStudentStatsPath(classId: string, studentId: string): string {
  return `/teacher/classes/${classId}/students/${studentId}`;
}

export function buildTeacherSubmissionPath(classId: string, studentId: string, submissionId: string): string {
  return `${buildStudentStatsPath(classId, studentId)}/submissions/${submissionId}`;
}

export function formatStudentStatsSubtitle(stats: StudentStats): string {
  return [stats.student.studentCode, stats.class.name, stats.class.cohort].filter(Boolean).join(" · ");
}

export interface AttemptRow extends StudentStatsAttempt {
  assignmentId: string;
  assignmentTitle: string;
}

// Mọi lần nộp của các bài (hoặc một bài), mới nhất trước
export function buildAttemptRows(assignments: StudentStatsAssignment[], assignmentId: string | null): AttemptRow[] {
  return assignments
    .filter((assignment) => assignmentId === null || assignment.id === assignmentId)
    .flatMap((assignment) =>
      assignment.attempts.map((attempt) => ({
        ...attempt,
        assignmentId: assignment.id,
        assignmentTitle: assignment.title,
      }))
    )
    .sort((left, right) => right.submittedAt.localeCompare(left.submittedAt));
}
