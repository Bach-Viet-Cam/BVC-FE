import {
  type AssignmentKind,
  type AssignmentStatus,
  type SheetGroupAssignment,
} from "@/features/classes/types/teacherAssignmentTypes";
import { ASSIGNMENT_KIND_LABELS } from "@/features/classes/utils/teacherAssignmentFormat";

export const PRACTICE_STAT_LABELS = {
  total: "Tổng lượt luyện tập",
  students: "Sinh viên đã tập",
  average: "Lượt trung bình / SV",
} as const;

export const PRACTICE_TEXT = {
  last7Days: "Lượt luyện tập 7 ngày gần nhất",
  byClass: "Sinh viên đã tập theo lớp",
} as const;

export const MEDIA_TEXT = {
  sheet: "Sheet nhạc được gán",
  audio: "Audio mẫu",
  video: "Video hướng dẫn",
  noSheet: "Bài tập này chưa gắn sheet nhạc.",
  noAudio: "Bài tập này chưa có audio mẫu.",
  noVideo: "Bài tập này chưa có video hướng dẫn.",
  noSheetFile: "Sheet nhạc chưa có tệp để xem.",
  open: "Mở",
} as const;

export const INFO_TEXT = {
  general: "Thông tin chung",
  config: "Cấu hình",
  sheetAssignments: "Các bài tập dùng sheet này",
  assignTo: "Giao cho:",
  noDescription: "Chưa có mô tả.",
  differs: "(khác nhau giữa các lớp)",
  unlimited: "Không giới hạn",
  empty: "—",
} as const;

export const INFO_FIELD_LABELS = {
  kind: "Loại",
  status: "Trạng thái",
  className: "Lớp",
  classCount: "Số lớp",
  publishedAt: "Ngày đăng",
  updatedAt: "Cập nhật lần cuối",
  createdBy: "Người tạo",
  tempo: "Tempo",
  threshold: "Ngưỡng đạt",
  maxSubmissions: "Nộp tối đa",
  version: "Phiên bản",
} as const;

// "2,3" - Vietnamese decimal comma, at most one decimal.
export function formatAverage(value: number): string {
  return String(Math.round(value * 10) / 10).replace(".", ",");
}

export function formatPracticedRatio(practiced: number, members: number): string {
  return `${practiced} / ${members}`;
}

export function practicedPercent(practiced: number, members: number): number {
  return members > 0 ? Math.round((practiced / members) * 100) : 0;
}

export function formatTempo(bpm: number | null): string {
  return bpm ? `${bpm} BPM` : INFO_TEXT.empty;
}

export function formatThreshold(minAccuracy: number): string {
  return `≥ ${minAccuracy}%`;
}

export function formatMaxSubmissions(max: number | null): string {
  return max === null ? INFO_TEXT.unlimited : String(max);
}

export function formatPageCount(pages: number): string {
  return `${pages} trang`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(Math.round((bytes / (1024 * 1024)) * 10) / 10).toString().replace(".", ",")} MB`;
}

export function formatDuration(seconds: number): string {
  const total = Math.round(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export function hasDifferentConfig(
  copies: SheetGroupAssignment[],
  field: "effectiveBpm" | "maxSubmissions" | "minAccuracy"
): boolean {
  return copies.some((copy) => copy[field] !== copies[0][field]);
}

export function uniqueStatuses(copies: { status: AssignmentStatus }[]): AssignmentStatus[] {
  return [...new Set(copies.map((copy) => copy.status))];
}

export const DRAWER_TEXT = {
  overline: "Chi tiết bài tập",
  close: "Đóng chi tiết",
  tabsLabel: "Nội dung chi tiết bài tập",
  edit: "Sửa",
  delete: "Xóa",
  assignOther: "Gán bài này cho lớp khác",
  noStudents: "Lớp chưa có sinh viên.",
} as const;

export const DRAWER_TABS = [
  { value: "practice", label: "Thống kê luyện tập" },
  { value: "media", label: "Sheet & media" },
  { value: "info", label: "Thông tin & cấu hình" },
] as const;

export const STATUS_ACTIONS: Record<AssignmentStatus, { action: "publish" | "close" | "reopen"; label: string }> = {
  DRAFT: { action: "publish", label: "Đăng" },
  PUBLISHED: { action: "close", label: "Đóng" },
  CLOSED: { action: "reopen", label: "Mở lại" },
};

export function studentsHeading(count: number): string {
  return `Sinh viên (${count})`;
}

export function confirmCopy(action: "close" | "delete", title: string) {
  return action === "delete"
    ? { title: `Xóa bài tập ${title}?`, description: "Bài tập sẽ bị ẩn với cả lớp.", confirmLabel: "Xóa" }
    : { title: `Đóng bài tập ${title}?`, description: "Sinh viên sẽ không thể nộp bài nữa.", confirmLabel: "Đóng" };
}

// Sheet-mode header: kinds and "n bài tập" count every copy; only the class count leaves drafts out.
export function sheetGroupMeta(copies: { status: AssignmentStatus; kind: AssignmentKind; classId: string }[]): string {
  const kinds = [...new Set(copies.map((copy) => ASSIGNMENT_KIND_LABELS[copy.kind]))];
  const classCount = new Set(copies.filter((copy) => copy.status !== "DRAFT").map((copy) => copy.classId)).size;
  return [kinds.join(", "), `${copies.length} bài tập`, `${classCount} lớp`].filter(Boolean).join(" · ");
}
