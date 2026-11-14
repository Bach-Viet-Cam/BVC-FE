import {
  type AssignmentKind,
  type AssignSkipReason,
  type OverviewAssignment,
  type OverviewClass,
  type OverviewEmptyReason,
  type OverviewSemester,
  type SheetStat,
} from "@/features/classes/types/teacherAssignmentTypes";
import { matchesKeyword } from "@/shared/utils/searchUtils";

export interface SheetGroup {
  sheetMusicId: string;
  sheetTitle: string;
  assignments: OverviewAssignment[];
  classNames: string[];
  kinds: AssignmentKind[];
  practicedStudents: number;
  memberCount: number;
  practiceCount: number;
}

export interface SourceGroup {
  key: string;
  representativeId: string;
  title: string;
  kind: AssignmentKind;
  sheetTitle: string | null;
  status: OverviewAssignment["status"];
  holderClassIds: string[];
  holderClassNames: string[];
}

// Same identity as the BE: title (trimmed, case-insensitive) + kind + sheet music.
export function assignmentGroupKey(item: { title: string; kind: AssignmentKind; sheetMusicId: string | null }): string {
  return [item.title.trim().toLowerCase(), item.kind, item.sheetMusicId ?? ""].join("|");
}

export function filterOverviewClasses(classes: OverviewClass[], query: string): OverviewClass[] {
  if (!query.trim()) return classes;
  return classes.flatMap((item) => {
    const assignments = item.assignments.filter((assignment) => matchesKeyword(query, [assignment.title]));
    return assignments.length > 0 ? [{ ...item, assignments }] : [];
  });
}

export function groupBySheet(classes: OverviewClass[], sheetStats: SheetStat[]): SheetGroup[] {
  const groups = new Map<string, SheetGroup>();
  const statBySheet = new Map(sheetStats.map((stat) => [stat.sheetMusicId, stat]));
  for (const item of classes) {
    for (const assignment of item.assignments) {
      if (!assignment.sheetMusicId) continue;
      const group = groups.get(assignment.sheetMusicId) ?? {
        sheetMusicId: assignment.sheetMusicId,
        sheetTitle: assignment.sheetTitle ?? assignment.title,
        assignments: [],
        classNames: [],
        kinds: [],
        practicedStudents: statBySheet.get(assignment.sheetMusicId)?.practicedStudents ?? 0,
        memberCount: statBySheet.get(assignment.sheetMusicId)?.memberCount ?? 0,
        practiceCount: statBySheet.get(assignment.sheetMusicId)?.practiceCount ?? 0,
      };
      group.assignments.push(assignment);
      if (!group.classNames.includes(item.name)) group.classNames.push(item.name);
      if (!group.kinds.includes(assignment.kind)) group.kinds.push(assignment.kind);
      groups.set(assignment.sheetMusicId, group);
    }
  }
  return [...groups.values()].sort((first, second) => second.practiceCount - first.practiceCount);
}

export function groupAssignmentSources(classes: OverviewClass[]): SourceGroup[] {
  const groups = new Map<string, SourceGroup & { latest: string }>();
  for (const item of classes) {
    for (const assignment of item.assignments) {
      const key = assignmentGroupKey(assignment);
      const group = groups.get(key) ?? {
        key,
        representativeId: assignment.id,
        title: assignment.title,
        kind: assignment.kind,
        sheetTitle: assignment.sheetTitle,
        status: assignment.status,
        holderClassIds: [],
        holderClassNames: [],
        latest: "",
      };
      group.holderClassIds.push(item.id);
      group.holderClassNames.push(item.name);
      if (assignment.updatedAt > group.latest) {
        group.latest = assignment.updatedAt;
        group.representativeId = assignment.id;
        group.status = assignment.status;
      }
      groups.set(key, group);
    }
  }
  return [...groups.values()].map(({ latest: _latest, ...group }) => group);
}

export function summarizeClass(item: OverviewClass) {
  return {
    assignmentCount: item.assignments.length,
    openCount: item.assignments.filter((assignment) => assignment.status === "PUBLISHED").length,
    practiceCount: item.assignments.reduce((total, assignment) => total + assignment.practiceCount, 0),
  };
}

export function formatDayMonth(isoDate: string): string {
  const [, month, day] = isoDate.split("-");
  return `${day}/${month}`;
}

export function emptyReasonMessage(
  reason: OverviewEmptyReason,
  context: { semester: OverviewSemester | null; today: Date }
): string {
  if (reason === "NO_SEMESTER_CONFIGURED") return "Chưa có học kỳ nào được cấu hình. Vui lòng liên hệ quản trị viên.";
  if (reason === "NO_CURRENT_SEMESTER") {
    const day = String(context.today.getDate()).padStart(2, "0");
    const month = String(context.today.getMonth() + 1).padStart(2, "0");
    return `Hôm nay (${day}/${month}/${context.today.getFullYear()}) không nằm trong học kỳ nào đã cấu hình.`;
  }
  return `Bạn chưa có lớp nào trong học kỳ ${context.semester?.name ?? "hiện tại"}.`;
}

export const ASSIGN_SKIP_LABELS: Record<AssignSkipReason, string> = {
  NOT_CLASS_LECTURER: "Bạn không phụ trách lớp này",
  NOT_CURRENT_SEMESTER: "Lớp không thuộc học kỳ hiện tại",
  CLASS_NOT_ACTIVE: "Lớp đã kết thúc",
  SHEET_UNAVAILABLE: "Sheet nhạc không dùng được cho nhạc cụ của lớp",
  ALREADY_ASSIGNED: "Lớp đã có bài này",
  KIND_SLOT_TAKEN: "Lớp đã có bài cùng loại (Độc tấu/Hòa tấu)",
};

// Shorter wording than ASSIGNMENT_STATUS_LABELS: this page shows whether students can still practise.
export const OVERVIEW_STATUS_LABELS: Record<OverviewAssignment["status"], string> = {
  PUBLISHED: "Đang mở",
  DRAFT: "Nháp",
  CLOSED: "Đã đóng",
};
