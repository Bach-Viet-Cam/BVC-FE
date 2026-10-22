import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { ListState } from "@/features/classes/components/ListState";
import { SearchInput } from "@/features/classes/components/SearchInput";
import { useClassProgress } from "@/features/classes/hooks/useClassProgress";
import { type ProgressItem, type ProgressSortKey, type ProgressStatus } from "@/features/classes/types/progressTypes";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { type SortDirection } from "@/shared/types/commonTypes";
import { cn } from "@/shared/utils/cn";

const COLUMNS = "grid-cols-[1.2fr_2fr_1fr_2.4fr_1.4fr]";

const STATUS_META: Record<ProgressStatus, { label: string; dot: string }> = {
  ON_TRACK: { label: "Đúng tiến độ", dot: "bg-bvc-ok" },
  AT_RISK: { label: "Có nguy cơ", dot: "bg-bvc-warn" },
  BEHIND: { label: "Chậm tiến độ", dot: "bg-bvc-error" },
};

const CHIPS: { status: ProgressStatus; countKey: "onTrack" | "atRisk" | "behind" }[] = [
  { status: "ON_TRACK", countKey: "onTrack" },
  { status: "AT_RISK", countKey: "atRisk" },
  { status: "BEHIND", countKey: "behind" },
];

// Phone sort picker: the table header sorts on web.
const MOBILE_SORTS: { value: string; label: string; sortBy: ProgressSortKey; sortDir: SortDirection }[] = [
  { value: "studentCode:asc", label: "Mã SV", sortBy: "studentCode", sortDir: "asc" },
  { value: "username:asc", label: "Họ tên", sortBy: "username", sortDir: "asc" },
  { value: "averageAccuracy:asc", label: "Accuracy thấp → cao", sortBy: "averageAccuracy", sortDir: "asc" },
  { value: "averageAccuracy:desc", label: "Accuracy cao → thấp", sortBy: "averageAccuracy", sortDir: "desc" },
];

const NOTE =
  "Trạng thái tính theo accuracy trung bình các bài đã được phân tích (không gồm bài bonus), so với accuracy tối thiểu và biên “Có nguy cơ” trong cấu hình hệ thống.";

function AccuracyBar({ value, barClassName }: { value: number | null; barClassName: string }) {
  if (value === null) return <span className="text-bvc-muted">-</span>;
  return (
    <span className="flex items-center gap-[10px]">
      <span className={cn("h-[8px] overflow-hidden rounded-full bg-bvc-bar", barClassName)}>
        <span className="block h-full rounded-full bg-bvc-ok" style={{ width: `${value}%` }} />
      </span>
      <span className="font-mono text-bvc-ink">{value}%</span>
    </span>
  );
}

function StatusText({ status }: { status: ProgressStatus | null }) {
  if (!status) return <span className="text-bvc-muted">-</span>;
  return (
    <span className="flex items-center gap-[6px] whitespace-nowrap">
      <span className={`size-[7px] shrink-0 rounded-full ${STATUS_META[status].dot}`} />
      <span className="text-bvc-muted">{STATUS_META[status].label}</span>
    </span>
  );
}

function ProgressCard({ item }: { item: ProgressItem }) {
  return (
    <article className="flex flex-col gap-[10px] rounded-[18px] border border-bvc-border px-[14px] py-[13px] text-[13px]">
      <div className="flex justify-between gap-[10px]">
        <span className="flex min-w-0 flex-col gap-[2px]">
          <span className="truncate text-[15px] font-bold text-bvc-ink">{item.username}</span>
          <span className="font-mono text-[12px] text-bvc-muted">{item.studentCode ?? "-"}</span>
        </span>
        <StatusText status={item.status} />
      </div>
      <div className="flex items-center justify-between gap-[10px]">
        <AccuracyBar value={item.averageAccuracy} barClassName="w-[140px]" />
        <span className="text-[12.5px] text-bvc-muted">{item.submissionCount} bài nộp</span>
      </div>
    </article>
  );
}

interface ClassProgressBoardProps {
  classId: string;
}

// UC-12 progress of one class: status chips, search and a sortable table (web) / cards (phone).
export function ClassProgressBoard({ classId }: ClassProgressBoardProps) {
  const isMobile = useIsMobile();
  const { filters, updateFilters, result, isLoading, error, reload } = useClassProgress(classId);
  const [searchText, setSearchText] = useState("");
  const appliedQuery = filters.q;
  const items = result?.items ?? [];
  const isFiltered = Boolean(filters.q) || filters.status !== undefined;

  useEffect(() => {
    const nextQuery = searchText.trim();
    if (nextQuery === appliedQuery) return;
    const timer = window.setTimeout(() => updateFilters({ q: nextQuery }), 300);
    return () => window.clearTimeout(timer);
  }, [searchText, appliedQuery, updateFilters]);

  const toggleSort = (key: ProgressSortKey) => {
    updateFilters({ sortBy: key, sortDir: filters.sortBy === key && filters.sortDir === "asc" ? "desc" : "asc" });
  };
  const sortIcon = (key: ProgressSortKey) =>
    filters.sortBy === key ? filters.sortDir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} /> : null;
  const listState = {
    isLoading: isLoading && !result,
    error,
    isEmpty: items.length === 0,
    emptyMessage: isFiltered ? "Không tìm thấy sinh viên phù hợp." : "Lớp chưa có sinh viên.",
    onRetry: reload,
  };

  return (
    <div className="flex flex-col gap-[14px] lg:gap-[16px]">
      <div className="flex flex-col gap-[10px] md:flex-row md:flex-wrap md:items-center">
        <div className="-mx-[18px] flex gap-[8px] overflow-x-auto px-[18px] [scrollbar-width:none] md:mx-0 md:px-0">
          {CHIPS.map(({ status, countKey }) => {
            const isActive = filters.status === status;
            return (
              <button
                key={status}
                type="button"
                aria-pressed={isActive}
                onClick={() => updateFilters({ status: isActive ? undefined : status })}
                className={cn(
                  "flex h-[40px] shrink-0 cursor-pointer items-center gap-[8px] whitespace-nowrap rounded-full border px-[14px] text-[13.5px]",
                  isActive ? "border-bvc-ink bg-bvc-surface font-bold" : "border-bvc-border-strong bg-white"
                )}
              >
                <span className={`size-[8px] rounded-full ${STATUS_META[status].dot}`} />
                {STATUS_META[status].label}
                <span className="font-mono text-bvc-muted">{result?.summary[countKey] ?? 0}</span>
              </button>
            );
          })}
        </div>
        <div className="flex gap-[8px] md:ml-auto md:w-[320px]">
          <SearchInput
            id={`progress-search-${classId}`}
            label="Mã hoặc tên sinh viên"
            value={searchText}
            onChange={setSearchText}
          />
          {isMobile && (
            <select
              aria-label="Sắp xếp"
              value={`${filters.sortBy}:${filters.sortDir}`}
              onChange={(event) => {
                const sort = MOBILE_SORTS.find((option) => option.value === event.target.value);
                if (sort) updateFilters({ sortBy: sort.sortBy, sortDir: sort.sortDir });
              }}
              className="h-[46px] w-[120px] shrink-0 rounded-[22px] border border-bvc-border-strong bg-white px-[10px] text-[13px] text-bvc-ink"
            >
              {MOBILE_SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {isMobile ? (
        <ListState {...listState}>
          <div className="flex flex-col gap-[10px]">
            {items.map((item) => (
              <ProgressCard key={item.userId} item={item} />
            ))}
          </div>
        </ListState>
      ) : (
        <div className="flex flex-col overflow-x-auto rounded-[20px] border border-bvc-border bg-white">
          <div className="flex min-w-[720px] flex-col">
            <div
              className={`grid ${COLUMNS} gap-[14px] border-b border-bvc-border px-[20px] py-[11px] text-[12px] font-bold uppercase tracking-[0.08em] text-bvc-muted`}
            >
              <button
                type="button"
                onClick={() => toggleSort("studentCode")}
                className="flex cursor-pointer items-center gap-[4px] text-left uppercase"
              >
                Mã SV {sortIcon("studentCode")}
              </button>
              <button
                type="button"
                onClick={() => toggleSort("username")}
                className="flex cursor-pointer items-center gap-[4px] text-left uppercase"
              >
                Họ tên {sortIcon("username")}
              </button>
              <span>Bài nộp</span>
              <button
                type="button"
                onClick={() => toggleSort("averageAccuracy")}
                className="flex cursor-pointer items-center gap-[4px] text-left uppercase"
              >
                Accuracy TB {sortIcon("averageAccuracy")}
              </button>
              <span>Trạng thái</span>
            </div>
            {listState.isLoading || error || items.length === 0 ? (
              <div className="p-[12px]">
                <ListState {...listState}>{null}</ListState>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.userId}
                  className={`grid min-h-[52px] ${COLUMNS} items-center gap-[14px] border-b border-bvc-line px-[20px] py-[8px] text-[13px] last:border-0`}
                >
                  <span className="font-mono text-bvc-muted">{item.studentCode ?? "-"}</span>
                  <span className="truncate font-semibold text-bvc-ink">{item.username}</span>
                  <span className="font-mono text-bvc-muted">{item.submissionCount}</span>
                  <AccuracyBar value={item.averageAccuracy} barClassName="w-[120px]" />
                  <StatusText status={item.status} />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <p className="m-0 text-[12.5px] leading-[1.5] text-bvc-muted">{NOTE}</p>
    </div>
  );
}
