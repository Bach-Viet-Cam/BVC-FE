import { type UserStatus } from "@/features/platform/types/userTypes";

export interface DailyCount {
  date: string;
  count: number;
}

export interface AdminAlert {
  level: "ERROR" | "WARN";
  code: string;
  message: string;
}

export interface StorageSummary {
  usedBytes: number;
  capacityBytes: number;
  usedPercent: number;
  fileCount: number;
}

export interface AdminRecentUser {
  id: string;
  username: string;
  email: string;
  role: number;
  status: UserStatus;
  createdAt: string;
}

export interface AdminConfigSummary {
  label: string;
  value: string;
}

export interface AdminQueueItem {
  id: string;
  fileName: string;
  studentName: string;
  waitSeconds: number;
}

export interface AdminFailureItem {
  id: string;
  occurredAt: string;
  message: string;
}

export interface AdminOverview {
  activeUsers7d: number;
  submissions7d: number;
  failed24h: number;
  storage: StorageSummary;
  submissionsByDay: DailyCount[];
  recentUsers: AdminRecentUser[];
  alerts: AdminAlert[];
  config: AdminConfigSummary[];
}

export interface AdminMonitoring {
  queueCount: number;
  queue: AdminQueueItem[];
  total7d: number;
  failed7d: number;
  errorRate7d: number;
  submissions24h: number;
  storage: StorageSummary;
  submissionsByDay: DailyCount[];
  failures: AdminFailureItem[];
  alerts: AdminAlert[];
}
