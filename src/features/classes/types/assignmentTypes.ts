import { type SubmissionStatus } from "@/features/classes/types/teacherAssignmentTypes";

export type AssignmentType = "PRACTICE" | "RHYTHM" | "RECORDING" | "SHEET" | "BONUS" | "EXAM";
export type StudentAssignmentStatus = "PASSED" | "SUBMITTED" | "OVERDUE" | "NOT_SUBMITTED";

export interface AssignmentListItem {
  id: string;
  classId: string;
  title: string;
  className: string;
  type: AssignmentType;
  kind?: "SOLO" | "ENSEMBLE" | "BONUS" | "OTHER" | null;
  deadline: string;
  status: StudentAssignmentStatus;
  usedSubmissions: number;
  maxSubmissions: number;
  minAccuracy: number;
  bonusPoints: number | null;
}

export interface MySubmission {
  id: string;
  attemptNumber: number;
  status: SubmissionStatus;
  accuracy: number | null;
  submittedAt: string;
  comment: { content: string; updatedAt: string } | null;
}

export interface AssignmentDetail extends AssignmentListItem {
  description: string;
  weekNo: number | null;
  targetBpm: number | null;
  // Bản nhạc được giao; nút "Thu âm / Tải bản thu" mở thẳng màn ghi âm của bản này
  sheetMusicId: string | null;
  pieceId: string | null;
  pieceTitle: string | null;
  rubric: { name: string; weight: number }[];
  canSubmit: boolean;
  hasEnsembleTracks: boolean;
  submissions: MySubmission[]; // lượt mới nhất trước
}

export interface MyAssignmentsParams {
  type: "BONUS" | "NON_BONUS";
  q?: string;
  sortBy: "deadline" | "title";
  sortDir: "asc" | "desc";
}
