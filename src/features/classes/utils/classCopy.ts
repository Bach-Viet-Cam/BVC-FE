import {
  type ApiFieldError,
  type ClassCopySource,
  type CopyAssignmentPayload,
  type CopyAssignmentRow,
} from "@/features/classes/types/classTypes";
import { ASSIGNMENT_KIND_LABELS } from "@/features/classes/utils/teacherAssignmentFormat";

export const COPY_KIND_DUPLICATED = (kind: "SOLO" | "ENSEMBLE"): string =>
  `Không thể lưu bài tập vì danh sách sao chép có nhiều hơn một bài ${ASSIGNMENT_KIND_LABELS[kind]}.`;

export function toCopyRows(source: ClassCopySource): CopyAssignmentRow[] {
  return source.assignments.map((a) => ({
    key: a.id,
    checked: true,
    content: {
      title: a.title,
      description: a.description,
      kind: a.kind,
      sheetMusicId: a.sheetMusic?.id ?? null,
      requiredBpm: a.requiredBpm,
    },
    sheetMusic: a.sheetMusic,
    status: a.status === "CLOSED" ? "PUBLISHED" : a.status,
    error: null,
  }));
}

export function findKindConflicts(rows: CopyAssignmentRow[]): Map<string, string> {
  const conflicts = new Map<string, string>();
  for (const kind of ["SOLO", "ENSEMBLE"] as const) {
    const group = rows.filter((r) => r.checked && r.content.kind === kind);
    if (group.length > 1) {
      for (const r of group) conflicts.set(r.key, COPY_KIND_DUPLICATED(kind));
    }
  }
  return conflicts;
}

export function buildCopyAssignments(rows: CopyAssignmentRow[]): CopyAssignmentPayload[] {
  return rows.filter((r) => r.checked).map((r) => ({ ...r.content, status: r.status }));
}

export function mapCopyErrors(
  rows: CopyAssignmentRow[],
  fieldErrors: ApiFieldError[]
): { rowErrors: Map<string, string>; rest: ApiFieldError[] } {
  const checked = rows.filter((r) => r.checked);
  const rowErrors = new Map<string, string>();
  const rest: ApiFieldError[] = [];
  for (const err of fieldErrors) {
    const match = /^assignments\.(\d+)\./.exec(err.field);
    const target = match ? checked[Number(match[1])] : undefined;
    if (target) {
      if (!rowErrors.has(target.key)) rowErrors.set(target.key, err.message);
    } else {
      rest.push(err);
    }
  }
  return { rowErrors, rest };
}
