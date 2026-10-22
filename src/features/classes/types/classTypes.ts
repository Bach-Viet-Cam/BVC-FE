export type ClassStatus = "ACTIVE" | "ENDED";
export type ClassStatusFilter = ClassStatus | "ALL";
export type AccountStatus = "PENDING" | "ACTIVE" | "LOCKED";
export type AccountStatusFilter = "ALL" | "ACTIVE" | "PENDING";

export interface Instrument {
  id: string;
  name: string;
  isActive: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

export interface ClassSummary {
  id: string;
  name: string;
  cohort: string;
  status: ClassStatus;
  instrument: { id: string; name: string };
  startDate: string;
  endDate: string;
  memberCount: number;
}

export interface ClassDetail extends ClassSummary {
  description: string | null;
  hasStarted: boolean;
  isReadOnly: boolean;
  endedAt: string | null;
}

export interface ClassListParams {
  q?: string;
  cohort?: string;
  instrumentId?: string;
  status: ClassStatusFilter;
  page?: number;
  limit?: number;
}

export interface ClassListResult {
  items: ClassSummary[];
  pagination: Pagination;
  activeCount: number;
  cohorts: string[];
}

export interface ClassPayload {
  name: string;
  cohort: string;
  instrumentId: string;
  description: string | null;
}

// Configured by System Admin; a class runs exactly from startDate to endDate of its semester.
export interface Semester {
  name: string;
  startDate: string;
  endDate: string;
}

export interface SemesterList {
  items: Semester[];
  defaultName: string | null;
}

export interface Member {
  studentId: string;
  fullName: string;
  studentCode: string | null;
  email: string;
  accountStatus: AccountStatus;
  joinedAt: string;
}

export interface MemberListParams {
  q?: string;
  accountStatus: AccountStatusFilter;
  page?: number;
  limit?: number;
}

export interface MemberListResult {
  items: Member[];
  pagination: Pagination;
  totalMembers: number;
}

export interface StudentPayload {
  studentCode: string;
  fullName: string;
  email: string;
}

export interface ImportRow {
  rowNumber: number;
  studentCode: string;
  fullName: string;
  email: string;
  isValid: boolean;
  reason: string | null;
}

export interface ImportPreview {
  logId: string;
  fileName: string;
  status: "PREVIEW" | "CONFIRMED" | "CANCELLED";
  totalRows: number;
  validRows: number;
  errorRows: number;
  rows: ImportRow[];
}

export interface ImportConfirmResult {
  importedCount: number;
  skippedCount: number;
}

export interface ApiFieldError {
  field: string;
  code?: string;
  message: string;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  code?: string;
  errors?: ApiFieldError[];
}
