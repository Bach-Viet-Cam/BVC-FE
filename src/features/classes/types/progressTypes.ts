import { type SortDirection } from "@/shared/types/commonTypes";

export type ProgressStatus = "ON_TRACK" | "AT_RISK" | "BEHIND";
export type ProgressSortKey = "studentCode" | "username" | "averageAccuracy";

export interface ClassOption {
  id: string;
  name: string;
}

export interface ProgressItem {
  userId: string;
  username: string;
  studentCode: string | null;
  submissionCount: number;
  averageAccuracy: number | null;
  status: ProgressStatus | null;
}

export interface ProgressResult {
  summary: { onTrack: number; atRisk: number; behind: number };
  items: ProgressItem[];
}

export interface ProgressParams {
  status?: ProgressStatus;
  q?: string;
  sortBy: ProgressSortKey;
  sortDir: SortDirection;
}
