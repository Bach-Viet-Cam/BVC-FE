import { matchesKeyword } from "@/shared/utils/searchUtils";

export interface HomeClass {
  id: string;
  name: string;
  cohort: string;
  memberCount: number;
  weekLabel: string;
  onTrack: number;
  atRisk: number;
  behind: number;
}

export interface HomeTask {
  id: string;
  tone: "warn" | "ok";
  message: string;
  actionLabel: string;
  path: string;
}

export function formatWeekLabel(week: string): string {
  return week === "-" ? "Chưa bắt đầu" : `Tuần ${week}`;
}

// "Cần xử lý hôm nay": one row per class with students to watch, plus unpublished drafts.
export function buildHomeTasks(classes: HomeClass[], draftCount: number): HomeTask[] {
  const classTasks = classes
    .filter((cls) => cls.atRisk + cls.behind > 0)
    .map<HomeTask>((cls) => ({
      id: `class-${cls.id}`,
      tone: "warn",
      message: `${cls.atRisk + cls.behind} sinh viên cần chú ý - ${cls.name}`,
      actionLabel: "Xem lớp",
      path: `/teacher/classes/${cls.id}`,
    }));
  if (draftCount === 0) return classTasks;
  return [
    ...classTasks,
    {
      id: "drafts",
      tone: "warn",
      message: `${draftCount} bài tập nháp chưa đăng`,
      actionLabel: "Xem bài tập",
      path: "/teacher/assignments",
    },
  ];
}

export type AttentionStatus = "AT_RISK" | "BEHIND";

export const ATTENTION_STATUS_LABELS: Record<AttentionStatus, string> = {
  BEHIND: "Chậm tiến độ",
  AT_RISK: "Có nguy cơ",
};

export interface AttentionStudent {
  userId: string;
  username: string;
  studentCode: string | null;
  classId: string;
  className: string;
  status: AttentionStatus;
  averageAccuracy: number | null;
}

export interface AttentionCandidate {
  userId: string;
  username: string;
  studentCode: string | null;
  classId: string;
  className: string;
  status: string | null;
  averageAccuracy: number | null;
}

// Behind first, then the lowest accuracy; a student without an analysed submission ranks last in its group.
export function rankAttentionStudents(candidates: AttentionCandidate[]): AttentionStudent[] {
  return candidates
    .filter((item): item is AttentionStudent => item.status === "AT_RISK" || item.status === "BEHIND")
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "BEHIND" ? -1 : 1;
      return (a.averageAccuracy ?? Number.POSITIVE_INFINITY) - (b.averageAccuracy ?? Number.POSITIVE_INFINITY);
    });
}

export interface TodaySubmissions {
  classId: string;
  className: string;
  cohort: string;
  memberCount: number;
  // null = the class has no published assignment of that kind.
  solo: number | null;
  ensemble: number | null;
}

export function isSameDay(iso: string | null, now: Date): boolean {
  return iso !== null && new Date(iso).toDateString() === now.toDateString();
}

// Students whose latest counted submission of the assignment was made today.
export function countTodaySubmitters(students: { lastSubmittedAt: string | null }[], now: Date): number {
  return students.filter((student) => isSameDay(student.lastSubmittedAt, now)).length;
}

const todayTotal = (row: TodaySubmissions) => (row.solo ?? 0) + (row.ensemble ?? 0);

// Most submitters today first, then by class name.
export function rankTodaySubmissions(rows: TodaySubmissions[]): TodaySubmissions[] {
  return [...rows].sort((a, b) => todayTotal(b) - todayTotal(a) || a.className.localeCompare(b.className, "vi"));
}

export const ALL_FILTER = "ALL";

export interface AttentionFilters {
  q: string;
  classId: string;
  status: AttentionStatus | typeof ALL_FILTER;
}

export function filterAttentionStudents(students: AttentionStudent[], filters: AttentionFilters): AttentionStudent[] {
  return students.filter(
    (student) =>
      (filters.classId === ALL_FILTER || student.classId === filters.classId) &&
      (filters.status === ALL_FILTER || student.status === filters.status) &&
      matchesKeyword(filters.q, [student.username, student.studentCode ?? ""])
  );
}

export type SubmissionActivity = typeof ALL_FILTER | "SUBMITTED" | "NONE";

export interface TodaySubmissionFilters {
  q: string;
  cohort: string;
  activity: SubmissionActivity;
}

export function filterTodaySubmissions(rows: TodaySubmissions[], filters: TodaySubmissionFilters): TodaySubmissions[] {
  return rows.filter((row) => {
    const hasSubmissions = todayTotal(row) > 0;
    return (
      (filters.cohort === ALL_FILTER || row.cohort === filters.cohort) &&
      (filters.activity === ALL_FILTER || (filters.activity === "SUBMITTED") === hasSubmissions) &&
      matchesKeyword(filters.q, [row.className])
    );
  });
}
