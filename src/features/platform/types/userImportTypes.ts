import { type StudentImportRow } from "@/features/platform/utils/studentImportParse";

export type { StudentImportRow };

export type StudentImportMode = "skip" | "update";
export type StudentImportAction = "CREATE" | "UPDATE" | "SKIP" | "ERROR";

export interface StudentImportRequest {
  rows: StudentImportRow[];
  mode: StudentImportMode;
  dryRun: boolean;
}

export interface StudentImportRowResult extends StudentImportRow {
  action: StudentImportAction;
  messages: string[];
  existingUserId: string | null;
}

export interface StudentImportSummary {
  total: number;
  create: number;
  update: number;
  skip: number;
  error: number;
}

export interface StudentImportResult {
  dryRun: boolean;
  results: StudentImportRowResult[];
  summary: StudentImportSummary;
  createdCount: number;
  updatedCount: number;
}
