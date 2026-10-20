import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { DesktopPageHeader } from "@/shared/components/bvc";
import { useStudentProgress } from "@/features/classes/hooks/useStudentProgress";
import { type ProgressSortKey, type ProgressStatus } from "@/features/classes/types/progressTypes";

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

export function StudentProgressPage() {
  const { classes, classId, setClassId, filters, updateFilters, result, isLoading, error } = useStudentProgress();
  const [searchText, setSearchText] = useState("");
  const appliedQuery = filters.q;

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
  const items = result?.items ?? [];

  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <DesktopPageHeader
        breadcrumb="SCR-M03-06 · Lớp học"
        title="Tiến độ sinh viên"
        actions={
          <select
            aria-label="Lớp"
            value={classId ?? ""}
            onChange={(event) => setClassId(event.target.value)}
            className="h-[44px] cursor-pointer rounded-[14px] border border-bvc-border-strong bg-white px-4 text-[14px] text-bvc-ink focus:outline-none"
          >
            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        }
      />

      <div className="flex flex-1 flex-col gap-[16px] overflow-y-auto p-[22px_32px_26px]">
        <div className="flex flex-wrap items-center gap-[10px]">
          {CHIPS.map(({ status, countKey }) => {
            const isActive = filters.status === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => updateFilters({ status: isActive ? undefined : status })}
                className={`flex h-[40px] cursor-pointer items-center gap-[8px] rounded-full border px-[14px] text-[13.5px] ${
                  isActive ? "border-bvc-ink bg-bvc-surface font-bold" : "border-bvc-border-strong bg-white"
                }`}
              >
                <span className={`size-[8px] rounded-full ${STATUS_META[status].dot}`} />
                {STATUS_META[status].label}
                <span className="font-mono text-bvc-muted">{result?.summary[countKey] ?? 0}</span>
              </button>
            );
          })}
          <input
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Mã hoặc tên sinh viên"
            maxLength={100}
            className="ml-auto h-[44px] w-[260px] rounded-[14px] border border-bvc-border-strong bg-white px-4 text-[14px] text-bvc-ink placeholder:text-bvc-faint focus:outline-none"
          />
        </div>

        <div className="flex flex-col overflow-hidden rounded-[20px] border border-bvc-border bg-white">
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
          {isLoading && <p className="px-[20px] py-[28px] text-[14px] text-bvc-muted">Đang tải...</p>}
          {!isLoading && error && <p className="px-[20px] py-[28px] text-[14px] text-bvc-error">{error}</p>}
          {!isLoading && !error && classes.length === 0 && (
            <p className="px-[20px] py-[28px] text-[14px] text-bvc-muted">Bạn chưa phụ trách lớp nào.</p>
          )}
          {!isLoading && !error && classes.length > 0 && items.length === 0 && (
            <p className="px-[20px] py-[28px] text-[14px] text-bvc-muted">Không tìm thấy sinh viên phù hợp.</p>
          )}
          {!isLoading &&
            !error &&
            items.map((item) => (
              <div
                key={item.userId}
                className={`grid min-h-[52px] ${COLUMNS} items-center gap-[14px] border-b border-bvc-line px-[20px] py-[8px] text-[13px] last:border-0`}
              >
                <span className="font-mono text-bvc-muted">{item.studentCode ?? "—"}</span>
                <span className="truncate font-semibold text-bvc-ink">{item.username}</span>
                <span className="font-mono text-bvc-muted">{item.submissionCount}</span>
                <span className="flex items-center gap-[10px]">
                  {item.averageAccuracy === null ? (
                    <span className="text-bvc-muted">-</span>
                  ) : (
                    <>
                      <span className="h-[8px] w-[120px] overflow-hidden rounded-full bg-bvc-bar">
                        <span
                          className="block h-full rounded-full bg-bvc-ok"
                          style={{ width: `${item.averageAccuracy}%` }}
                        />
                      </span>
                      <span className="font-mono text-bvc-ink">{item.averageAccuracy}%</span>
                    </>
                  )}
                </span>
                <span className="flex items-center gap-[6px]">
                  {item.status ? (
                    <>
                      <span className={`size-[7px] shrink-0 rounded-full ${STATUS_META[item.status].dot}`} />
                      <span className="text-bvc-muted">{STATUS_META[item.status].label}</span>
                    </>
                  ) : (
                    <span className="text-bvc-muted">-</span>
                  )}
                </span>
              </div>
            ))}
        </div>
        <p className="text-[12.5px] text-bvc-muted">
          Trạng thái tính theo accuracy trung bình các bài đã được phân tích (không gồm bài bonus), so với accuracy tối
          thiểu và biên “Có nguy cơ” trong cấu hình hệ thống.
        </p>
      </div>
    </main>
  );
}
