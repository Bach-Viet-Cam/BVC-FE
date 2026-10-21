export type AssignmentType = "PRACTICE" | "RHYTHM" | "RECORDING" | "SHEET" | "BONUS" | "EXAM";
export type StudentAssignmentStatus = "PASSED" | "SUBMITTED" | "OVERDUE" | "NOT_SUBMITTED";

export interface AssignmentListItem {
  id: string;
  classId: string;
  title: string;
  className: string;
  type: AssignmentType;
  deadline: string;
  status: StudentAssignmentStatus;
  usedSubmissions: number;
  maxSubmissions: number;
  minAccuracy: number;
  bonusPoints: number | null;
}

export interface AssignmentDetail extends AssignmentListItem {
  description: string;
  weekNo: number | null;
  targetBpm: number | null;
  pieceId: string | null;
  pieceTitle: string | null;
  rubric: { name: string; weight: number }[];
  canSubmit: boolean;
  hasEnsembleTracks: boolean;
}

export interface MyAssignmentsParams {
  type: "BONUS" | "NON_BONUS";
  q?: string;
  sortBy: "deadline" | "title";
  sortDir: "asc" | "desc";
}
