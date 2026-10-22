import { type AssignmentKind, type SubmissionStatus } from "@/features/classes/types/assignmentTypes";
import { type Pagination } from "@/features/classes/types/classTypes";

export type ProgressStatus = "ON_TRACK" | "AT_RISK" | "BEHIND";

export interface ProgressStudent {
  studentId: string;
  fullName: string;
  studentCode: string | null;
  average: number | null;
  status: ProgressStatus | null;
  assignmentsWithSubmissions: number;
  lastSubmittedAt: string | null;
}

export interface ClassProgress {
  counts: { ON_TRACK: number; AT_RISK: number; BEHIND: number; NO_DATA: number };
  students: ProgressStudent[];
}

export interface WeeklyAverage {
  week: number;
  startDate: string;
  endDate: string;
  average: number | null;
}

export interface StudentSummary {
  student: { id: string; fullName: string; studentCode: string | null };
  class: { id: string; name: string; cohort: string; instrument: { id: string; name: string }; startDate: string };
  average: number | null;
  status: ProgressStatus | null;
  minAccuracy: number;
  totalSessions: number;
  sessionsLast7Days: number;
  weekly: WeeklyAverage[];
}

export interface HistoryItem {
  submissionId: string;
  assignmentId: string;
  assignmentTitle: string;
  kind: AssignmentKind;
  status: SubmissionStatus;
  accuracy: number | null;
  submittedAt: string;
}

export interface HistoryParams {
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface StudentHistory {
  items: HistoryItem[];
  pagination: Pagination;
}

export type ProgressSortKey = "name" | "code" | "average" | "last";
export type SortDirection = "asc" | "desc";
