import { format, isSameDay, parseISO, startOfMonth, subDays } from "date-fns";
import type {
  SubmissionAdvancedFilter,
  SubmissionDatePreset,
  SubmissionDayGroup,
  SubmissionFilter,
  SubmissionHistoryItem,
  SubmissionHistoryQuery,
  SubmissionKind,
} from "@/features/practice/types/submissionHistoryTypes";

const ISO_DAY = "yyyy-MM-dd";

export const HISTORY_PAGE_SIZE = 20;

// Chưa hỗ trợ nộp theo đoạn: mọi bài nộp là cả bài
export const FULL_PIECE_LABEL = "Cả bài";

interface DayRange {
  from: string;
  to: string;
}

// Khoảng ngày (yyyy-MM-dd) của mốc đã chọn, tính từ hôm nay
function presetRange(preset: SubmissionDatePreset, today: Date): DayRange {
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

// Số nhóm lọc nâng cao đang có giá trị (tên bài, ngày, accuracy, loại bài)
export function countAdvancedFilters(advanced: SubmissionAdvancedFilter) {
  return [
    hasActiveTitle(advanced),
    hasActiveDate(advanced),
    hasActiveAccuracy(advanced),
    advanced.kinds.length > 0,
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

// Mốc ngày nhanh và khoảng ngày nâng cao cùng áp dụng (AND) nên gửi phần giao của hai khoảng.
// null = hai khoảng không giao nhau, chắc chắn không có bài nào khớp.
function intersectDates(filter: SubmissionFilter, today: Date): Partial<DayRange> | null {
  const preset = filter.datePreset ? presetRange(filter.datePreset, today) : null;
  const froms = [preset?.from, filter.advanced.fromDate].filter(Boolean) as string[];
  const tos = [preset?.to, filter.advanced.toDate].filter(Boolean) as string[];
  // yyyy-MM-dd so sánh được như chuỗi: lấy ngày bắt đầu muộn nhất và ngày kết thúc sớm nhất
  const from = froms.sort()[froms.length - 1];
  const to = tos.sort()[0];
  if (from && to && from > to) return null;
  return { from, to };
}

function toList(values: string[]) {
  return values.length > 0 ? values.join(",") : undefined;
}

function toNumber(value: string) {
  return value === "" ? undefined : Number(value);
}

// Bộ lọc trên màn → query của GET /practice/submissions; null khi chắc chắn rỗng (không cần gọi API)
export function toHistoryQuery(filter: SubmissionFilter, page: number, today: Date): SubmissionHistoryQuery | null {
  const dates = intersectDates(filter, today);
  if (!dates) return null;
  const title = filter.advanced.title.trim();
  return {
    pieceIds: toList(filter.pieceIds),
    fromDate: dates.from,
    toDate: dates.to,
    accuracyRanges: toList(filter.accuracyRanges),
    minAccuracy: toNumber(filter.advanced.minAccuracy),
    maxAccuracy: toNumber(filter.advanced.maxAccuracy),
    title: title || undefined,
    kinds: toList(filter.advanced.kinds),
    page,
    limit: HISTORY_PAGE_SIZE,
  };
}

// Mốc ngày yyyy-MM-dd cách hôm nay một số ngày (dùng cho popup lọc nâng cao)
export function daysAgoIso(days: number, today: Date = new Date()) {
  return format(subDays(today, days), ISO_DAY);
}

export function todayIso(today: Date = new Date()) {
  return format(today, ISO_DAY);
}

function dayLabel(day: string, today: Date) {
  const date = parseISO(day);
  if (isSameDay(date, today)) return "Hôm nay";
  if (isSameDay(date, subDays(today, 1))) return "Hôm qua";
  return format(date, "dd/MM/yyyy");
}

// Giữ nguyên thứ tự đầu vào (mới nhất trước), gom theo ngày nộp theo giờ máy
export function groupByDay(items: SubmissionHistoryItem[], today: Date = new Date()): SubmissionDayGroup[] {
  const groups: SubmissionDayGroup[] = [];
  for (const item of items) {
    const key = format(parseISO(item.submittedAt), ISO_DAY);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(item);
    else groups.push({ key, label: dayLabel(key, today), items: [item] });
  }
  return groups;
}

export const SUBMISSION_KIND_LABEL: Record<SubmissionKind, string> = {
  PRACTICE: "Luyện tập",
  BONUS: "Bonus",
  SOLO: "Độc tấu",
  ENSEMBLE: "Hòa tấu",
};

export function formatSubmittedAt(isoDateTime: string) {
  return format(parseISO(isoDateTime), "dd/MM/yyyy · HH:mm");
}

export function formatSubmittedDay(isoDateTime: string) {
  return format(parseISO(isoDateTime), "dd/MM/yyyy");
}

export function orderByDate<T extends Pick<SubmissionHistoryItem, "submittedAt">>(a: T, b: T) {
  return a.submittedAt <= b.submittedAt ? { older: a, newer: b } : { older: b, newer: a };
}
