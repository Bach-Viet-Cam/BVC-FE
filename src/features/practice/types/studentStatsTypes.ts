import type { AssignmentKind, SubmissionStatus } from "@/features/classes/types/teacherAssignmentTypes";

// GET /classes/:classId/students/:studentId/stats (giảng viên) và GET /me/stats (sinh viên) trả cùng một dạng.
export interface StudentStatsAttempt {
  submissionId: string;
  attemptNo: number;
  submittedAt: string;
  status: SubmissionStatus;
  accuracy: number | null;
  hasComment: boolean;
}

export interface StudentStatsAssignment {
  id: string;
  title: string;
  kind: AssignmentKind;
  bestAccuracy: number | null;
  attemptCount: number;
  attempts: StudentStatsAttempt[];
}

export interface StudentEvaluation {
  content: string;
  lecturerName: string;
  updatedAt: string;
}

export interface StatsClass {
  id: string;
  name: string;
  cohort: string;
  status: "ACTIVE" | "ENDED";
}

export interface StudentStats {
  student: { id: string; fullName: string; studentCode: string | null };
  class: StatsClass;
  evaluation: StudentEvaluation | null;
  canEvaluate: boolean;
  classes?: StatsClass[];
  assignments: StudentStatsAssignment[];
}
