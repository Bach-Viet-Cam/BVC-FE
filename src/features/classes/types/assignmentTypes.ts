import { type ClassStatus, type Pagination } from "@/features/classes/types/classTypes";

export type AssignmentKind = "SOLO" | "ENSEMBLE" | "BONUS" | "OTHER";
export type AssignmentStatus = "DRAFT" | "PUBLISHED" | "CLOSED";
export type StudentAssignmentStatus = "NOT_SUBMITTED" | "SUBMITTED" | "PASSED";
export type SubmissionStatus = "PROCESSING" | "COMPLETED" | "REJECTED" | "FAILED";

export interface AssignmentListItem {
  id: string;
  classId: string;
  className: string;
  status: AssignmentStatus;
  version: number;
  title: string;
  kind: AssignmentKind;
  submittedCount: number;
  memberCount: number;
  updatedAt: string;
}

export interface AssignmentListParams {
  classId?: string;
  kind?: AssignmentKind;
  status?: AssignmentStatus;
  q?: string;
  page?: number;
  limit?: number;
}

export interface AssignmentListResult {
  items: AssignmentListItem[];
  pagination: Pagination;
}

export interface AssignmentPiece {
  id: string;
  title: string;
  defaultBpm: number | null;
  isAvailable: boolean;
}

export interface AssignmentBase {
  id: string;
  classId: string;
  className: string;
  classStatus: ClassStatus;
  status: AssignmentStatus;
  version: number;
  title: string;
  description: string | null;
  kind: AssignmentKind;
  piece: AssignmentPiece | null;
  requiredBpm: number | null;
  effectiveBpm: number | null;
  publishedAt: string | null;
  closedAt: string | null;
  updatedAt: string;
}

export interface AssignmentStudent {
  studentId: string;
  fullName: string;
  studentCode: string | null;
  status: StudentAssignmentStatus;
  submissionCount: number;
  lastSubmittedAt: string | null;
  bestAccuracy: number | null;
}

export interface AssignmentDetail extends AssignmentBase {
  students: AssignmentStudent[];
}

export interface SubmissionComment {
  content: string;
  updatedAt: string;
}

export interface StudentSubmission {
  id: string;
  attemptNumber: number;
  version: number;
  status: SubmissionStatus;
  accuracy: number | null;
  tempoDeviation: number | null;
  audioUrl: string;
  submittedAt: string;
  comment: SubmissionComment | null;
}

export interface StudentSubmissions {
  student: { id: string; fullName: string; studentCode: string | null };
  canComment: boolean;
  submissions: StudentSubmission[];
}

export interface ClassPiece {
  id: string;
  title: string;
  kind: "FINGER_EXERCISE" | "SONG";
  defaultBpm: number | null;
}

export interface AssignmentContentPayload {
  title: string;
  description: string | null;
  kind: AssignmentKind;
  pieceId: string | null;
  requiredBpm: number | null;
}

export interface CreateAssignmentPayload extends AssignmentContentPayload {
  classId: string;
  publish: boolean;
}

export type AssignmentAction = "publish" | "close" | "reopen";
