import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import type { AssignmentListItem } from "@/features/classes/types/assignmentTypes";
import type { SubmissionHistoryItem } from "@/features/practice/types/submissionHistoryTypes";

// 80 -> "80%", 72.5 -> "72.5%", null -> "-"
export function formatPercent(value: number | null) {
  if (value === null) return "-";
  return `${Number.isInteger(value) ? value : value.toFixed(1)}%`;
}

// Luôn có dấu để đọc ra chiều tăng / giảm mà không cần dựa vào màu
export function formatDelta(value: number) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "±";
  return `${sign}${formatPercent(Math.abs(value))}`;
}

// "2026-10-22" -> "T5" (cột biểu đồ) và "Thứ năm, 22/10" (tooltip)
export function formatDayShort(isoDate: string) {
  const weekday = parseISO(isoDate).getDay();
  return weekday === 0 ? "CN" : `T${weekday + 1}`;
}

export function formatDayLong(isoDate: string) {
  const label = format(parseISO(isoDate), "EEEE, dd/MM", { locale: vi });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

// Đã chấm xong thì mở màn kết quả; còn lại (đang xử lý, bị từ chối, lỗi) mở màn xử lý để xem trạng thái
export function submissionHref(item: Pick<SubmissionHistoryItem, "id" | "status">) {
  const path = `/practice/submissions/${item.id}`;
  return item.status === "COMPLETED" ? path : `${path}/processing`;
}

export interface AssignmentSummary {
  total: number;
  passed: number;
  submitted: number;
  notSubmitted: number;
  overdue: number;
}

export function summarizeAssignments(items: AssignmentListItem[]): AssignmentSummary {
  const count = (status: AssignmentListItem["status"]) => items.filter((item) => item.status === status).length;
  return {
    total: items.length,
    passed: count("PASSED"),
    submitted: count("SUBMITTED"),
    notSubmitted: count("NOT_SUBMITTED"),
    overdue: count("OVERDUE"),
  };
}
