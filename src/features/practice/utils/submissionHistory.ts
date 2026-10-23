import { format, isSameDay, parseISO, startOfMonth, subDays } from "date-fns";
import { fmtTime } from "@/features/practice/utils/practiceFormat";
import { MOCK_TODAY } from "@/features/practice/constants/submissionHistoryMockData";
import type {
  SubmissionAccuracyRange,
  SubmissionAdvancedFilter,
  SubmissionDatePreset,
  SubmissionDayGroup,
  SubmissionFilter,
  SubmissionHistoryItem,
  SubmissionKind,
  SubmissionPieceOption,
  SubmissionSegment,
} from "@/features/practice/types/submissionHistoryTypes";

const ISO_DAY = "yyyy-MM-dd";

const ACCURACY_MATCHERS: Record<SubmissionAccuracyRange, (accuracy: number) => boolean> = {
  ABOVE_90: (accuracy) => accuracy > 90,
  "70_90": (accuracy) => accuracy >= 70 && accuracy <= 90,
  "50_70": (accuracy) => accuracy >= 50 && accuracy < 70,
  BELOW_50: (accuracy) => accuracy < 50,
};

// Khoảng ngày (yyyy-MM-dd) của mốc đã chọn, tính từ MOCK_TODAY
function presetRange(preset: SubmissionDatePreset): { from: string; to: string } {
  const today = parseISO(MOCK_TODAY);
  const to = format(today, ISO_DAY);
  if (preset === "TODAY") return { from: to, to };
  if (preset === "LAST_3_DAYS") return { from: format(subDays(today, 2), ISO_DAY), to };
  if (preset === "LAST_7_DAYS") return { from: format(subDays(today, 6), ISO_DAY), to };
  return { from: format(startOfMonth(today), ISO_DAY), to };
}

export function hasActiveTitle(advanced: SubmissionAdvancedFilter) {
  return advanced.title.trim() !== "";
}

export function hasActiveDate(advanced: SubmissionAdvancedFilter) {
  return advanced.fromDate !== "" || advanced.toDate !== "";
}

export function hasActiveAccuracy(advanced: SubmissionAdvancedFilter) {
  return advanced.minAccuracy !== "" || advanced.maxAccuracy !== "";
}

// Số nhóm lọc nâng cao đang có giá trị (tên bài, ngày, accuracy)
export function countAdvancedFilters(advanced: SubmissionAdvancedFilter) {
  return [
    hasActiveTitle(advanced),
    hasActiveDate(advanced),
    hasActiveAccuracy(advanced),
    advanced.kinds.length > 0,
    advanced.scopes.length > 0,
  ].filter(Boolean).length;
}

// Số nhóm lọc nhanh đang chọn (bài hát, mốc ngày, khoảng accuracy)
export function countQuickFilters(filter: SubmissionFilter) {
  return [filter.pieceIds.length > 0, filter.datePreset !== null, filter.accuracyRanges.length > 0].filter(Boolean)
    .length;
}

export function countActiveFilters(filter: SubmissionFilter) {
  return countQuickFilters(filter) + countAdvancedFilters(filter.advanced);
}

function matchesAdvanced(item: SubmissionHistoryItem, advanced: SubmissionAdvancedFilter) {
  const title = advanced.title.trim().toLowerCase();
  const min = advanced.minAccuracy === "" ? null : Number(advanced.minAccuracy);
  const max = advanced.maxAccuracy === "" ? null : Number(advanced.maxAccuracy);
  const day = item.submittedAt.slice(0, 10);

  if (title && !item.title.toLowerCase().includes(title)) return false;
  if (advanced.kinds.length > 0 && !advanced.kinds.includes(item.kind)) return false;
  if (advanced.scopes.length > 0 && !advanced.scopes.includes(item.segment ? "PART" : "FULL")) return false;
  if (advanced.fromDate && day < advanced.fromDate) return false;
  if (advanced.toDate && day > advanced.toDate) return false;
  if (min !== null || max !== null) {
    // Bài đang xử lý chưa có accuracy nên không khớp khoảng accuracy
    if (item.accuracy === null) return false;
    if (min !== null && item.accuracy < min) return false;
    if (max !== null && item.accuracy > max) return false;
  }
  return true;
}

// Các mục trong một nhóm lọc nhanh là OR (chọn nhiều bài, nhiều khoảng accuracy); các nhóm và bộ lọc nâng cao là AND
export function filterSubmissions(items: SubmissionHistoryItem[], filter: SubmissionFilter) {
  const range = filter.datePreset ? presetRange(filter.datePreset) : null;

  return items.filter((item) => {
    const day = item.submittedAt.slice(0, 10);
    if (filter.pieceIds.length > 0 && !filter.pieceIds.includes(item.pieceId)) return false;
    if (range && (day < range.from || day > range.to)) return false;
    if (filter.accuracyRanges.length > 0) {
      // Bài đang xử lý chưa có accuracy nên không khớp khoảng nào
      if (item.accuracy === null) return false;
      const accuracy = item.accuracy;
      if (!filter.accuracyRanges.some((key) => ACCURACY_MATCHERS[key](accuracy))) return false;
    }
    return matchesAdvanced(item, filter.advanced);
  });
}

// Mốc ngày yyyy-MM-dd cách MOCK_TODAY một số ngày (dùng cho popup lọc nâng cao)
export function daysAgoIso(days: number) {
  return format(subDays(parseISO(MOCK_TODAY), days), ISO_DAY);
}

export function todayIso() {
  return MOCK_TODAY;
}

// Danh sách bài hát để chọn trong bộ lọc, không trùng, giữ thứ tự xuất hiện
export function getPieceOptions(items: SubmissionHistoryItem[]): SubmissionPieceOption[] {
  const seen = new Map<string, SubmissionPieceOption>();
  for (const item of items) {
    if (!seen.has(item.pieceId)) seen.set(item.pieceId, { id: item.pieceId, title: item.pieceTitle });
  }
  return [...seen.values()];
}

function dayLabel(day: string) {
  const today = parseISO(MOCK_TODAY);
  const date = parseISO(day);
  if (isSameDay(date, today)) return "Hôm nay";
  if (isSameDay(date, subDays(today, 1))) return "Hôm qua";
  return format(date, "dd/MM/yyyy");
}

// Giữ nguyên thứ tự đầu vào (mới nhất trước), gom theo ngày nộp
export function groupByDay(items: SubmissionHistoryItem[]): SubmissionDayGroup[] {
  const groups: SubmissionDayGroup[] = [];
  for (const item of items) {
    const key = item.submittedAt.slice(0, 10);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(item);
    else groups.push({ key, label: dayLabel(key), items: [item] });
  }
  return groups;
}

export const SUBMISSION_KIND_LABEL: Record<SubmissionKind, string> = {
  PRACTICE: "Luyện tập",
  BONUS: "Bonus",
  SOLO: "Độc tấu",
  ENSEMBLE: "Hòa tấu",
};

export function formatSegment(segment: SubmissionSegment | null) {
  return segment ? `${fmtTime(segment.startSec)}–${fmtTime(segment.endSec)}` : "Cả bài";
}

export function formatSubmittedAt(isoDateTime: string) {
  return format(parseISO(isoDateTime), "dd/MM/yyyy · HH:mm");
}

export function formatSubmittedDay(isoDateTime: string) {
  return format(parseISO(isoDateTime), "dd/MM/yyyy");
}

export function orderByDate(a: SubmissionHistoryItem, b: SubmissionHistoryItem) {
  return a.submittedAt <= b.submittedAt ? { older: a, newer: b } : { older: b, newer: a };
}
