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

export interface AssignmentSheetMusic {
  id: string;
  name: string;
  pieceId: string;
  pieceTitle: string;
  defaultBpm: number | null;
  isAvailable: boolean;
}

export interface AssignmentBase {
  maxSubmissions?: number | null;
  id: string;
  classId: string;
  className: string;
  classStatus: ClassStatus;
  status: AssignmentStatus;
  version: number;
  title: string;
  description: string | null;
  kind: AssignmentKind;
  sheetMusic: AssignmentSheetMusic | null;
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

export interface MediaFileInfo {
  url: string | null;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  durationSec: number | null;
  pageCount: number | null;
}

export interface AssignmentMedia {
  sheet: MediaFileInfo | null;
  referenceAudio: MediaFileInfo | null;
  tutorialVideo: MediaFileInfo | null;
}

export interface DailyPracticeCount {
  date: string;
  count: number;
}

export interface PracticeStats {
  totalPractices: number;
  practicedStudents: number;
  memberCount: number;
  averagePerStudent: number;
  last7Days: DailyPracticeCount[];
}

export interface ClassPractice {
  classId: string;
  className: string;
  practicedStudents: number;
  memberCount: number;
}

export interface AssignmentDetail extends AssignmentBase {
  students: AssignmentStudent[];
  practiceStats: PracticeStats;
  minAccuracy: number;
  createdBy: { id: string; fullName: string } | null;
  media: AssignmentMedia | null;
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

export interface ClassSheetMusic {
  id: string;
  name: string;
  pieceId: string;
  pieceTitle: string;
  kind: "FINGER_EXERCISE" | "SONG";
  defaultBpm: number | null;
}

export interface AssignmentContentPayload {
  maxSubmissions?: number | null;
  title: string;
  description: string | null;
  kind: AssignmentKind;
  sheetMusicId: string | null;
  requiredBpm: number | null;
}

export interface CreateAssignmentPayload extends AssignmentContentPayload {
  classId: string;
  publish: boolean;
}

export type AssignmentAction = "publish" | "close" | "reopen";

export type OverviewEmptyReason = "NO_SEMESTER_CONFIGURED" | "NO_CURRENT_SEMESTER" | "NO_CLASSES_IN_SEMESTER";
export type AssignSkipReason =
  | "NOT_CLASS_LECTURER"
  | "NOT_CURRENT_SEMESTER"
  | "CLASS_NOT_ACTIVE"
  | "SHEET_UNAVAILABLE"
  | "ALREADY_ASSIGNED"
  | "KIND_SLOT_TAKEN";

export interface OverviewSemester {
  name: string;
  startDate: string;
  endDate: string;
}

export interface OverviewAssignment {
  id: string;
  classId: string;
  title: string;
  kind: AssignmentKind;
  status: AssignmentStatus;
  version: number;
  sheetMusicId: string | null;
  sheetTitle: string | null;
  practiceCount: number;
  submittedCount: number;
  memberCount: number;
  updatedAt: string;
}

export interface OverviewClass {
  id: string;
  name: string;
  status: ClassStatus;
  memberCount: number;
  assignments: OverviewAssignment[];
}

export interface SheetStat {
  sheetMusicId: string;
  practicedStudents: number;
  memberCount: number;
  practiceCount: number;
}

export interface AssignmentOverview {
  semester: OverviewSemester | null;
  emptyReason: OverviewEmptyReason | null;
  classes: OverviewClass[];
  sheetStats: SheetStat[];
}

export interface SheetGroupAssignment extends OverviewAssignment {
  className: string;
  maxSubmissions: number | null;
  effectiveBpm: number | null;
  minAccuracy: number;
  publishedAt: string | null;
  createdBy: { id: string; fullName: string } | null;
}

export interface SheetGroupDetail {
  semester: OverviewSemester;
  sheetMusic: AssignmentSheetMusic;
  media: AssignmentMedia;
  assignments: SheetGroupAssignment[];
  practiceStats: PracticeStats;
  byClass: ClassPractice[];
}

export interface AssignPayload {
  assignmentIds: string[];
  classIds: string[];
}

export interface AssignResult {
  created: AssignmentBase[];
  skipped: { assignmentId: string; classId: string; reason: AssignSkipReason }[];
}
