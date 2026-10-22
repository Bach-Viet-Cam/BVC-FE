import { useMemo, useState } from "react";
import { ArrowDownUp } from "lucide-react";
import { ActionButton } from "@/features/classes/components/ActionButton";
import { ListState } from "@/features/classes/components/ListState";
import { ProgressRow } from "@/features/classes/components/ProgressRow";
import { SearchInput } from "@/features/classes/components/SearchInput";
import { useClassProgress } from "@/features/classes/hooks/useClassProgress";
import { type ProgressSortKey, type ProgressStatus, type SortDirection } from "@/features/classes/types/progressTypes";
import { PROGRESS_STATUS_LABELS, sortProgressStudents } from "@/features/classes/utils/progressFormat";

interface ProgressListProps {
  classId: string;
}

const ALL = "ALL";
const SORT_OPTIONS: Array<{ value: ProgressSortKey; label: string }> = [
  { value: "name", label: "Tên" },
  { value: "code", label: "Mã sinh viên" },
  { value: "average", label: "Độ chính xác TB" },
  { value: "last", label: "Lần nộp gần nhất" },
];
const COUNTER_ORDER: Array<{ key: ProgressStatus | "NO_DATA"; label: string }> = [
  { key: "ON_TRACK", label: PROGRESS_STATUS_LABELS.ON_TRACK },
  { key: "AT_RISK", label: PROGRESS_STATUS_LABELS.AT_RISK },
  { key: "BEHIND", label: PROGRESS_STATUS_LABELS.BEHIND },
  { key: "NO_DATA", label: "Chưa có dữ liệu" },
];
const SELECT_CLASSES =
  "h-[44px] rounded-[22px] border border-bvc-border-strong bg-white px-[12px] text-[13px] text-bvc-ink";

// UC-12 list (spec §4): counters, status filter, search on code or name, sortable on a phone via select + direction.
export function ProgressList({ classId }: ProgressListProps) {
  const [statusFilter, setStatusFilter] = useState<ProgressStatus | typeof ALL>(ALL);
  const [searchText, setSearchText] = useState("");
  const [sortKey, setSortKey] = useState<ProgressSortKey>("name");
  const [direction, setDirection] = useState<SortDirection>("asc");
  const { progress, isLoading, error, reload } = useClassProgress(classId);

  const rows = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    const filtered = (progress?.students ?? []).filter((student) => {
      if (statusFilter !== ALL && student.status !== statusFilter) return false;
      if (!query) return true;
      return (
        student.fullName.toLowerCase().includes(query) || (student.studentCode ?? "").toLowerCase().includes(query)
      );
    });
    return sortProgressStudents(filtered, sortKey, direction);
  }, [progress, statusFilter, searchText, sortKey, direction]);

  const hasStudents = (progress?.students.length ?? 0) > 0;

  return (
    <div className="flex grow flex-col gap-[10px] px-[18px] pb-[18px] pt-[14px]">
      {progress && !isLoading && !error && (
        <div className="no-scrollbar flex gap-[7px] overflow-x-auto">
          {COUNTER_ORDER.map((counter) => (
            <span
              key={counter.key}
              className="shrink-0 whitespace-nowrap rounded-[18px] bg-bvc-soft px-[12px] py-[8px] text-[12.5px]"
            >
              {counter.label} {progress.counts[counter.key]}
            </span>
          ))}
        </div>
      )}
      <SearchInput id="progress-search" label="Mã hoặc tên sinh viên" value={searchText} onChange={setSearchText} />
      <div className="flex flex-wrap gap-[8px]">
        <select
          aria-label="Trạng thái tiến độ"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as ProgressStatus | typeof ALL)}
          className={SELECT_CLASSES}
        >
          <option value={ALL}>Tất cả trạng thái</option>
          {(Object.keys(PROGRESS_STATUS_LABELS) as ProgressStatus[]).map((status) => (
            <option key={status} value={status}>
              {PROGRESS_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        <select
          aria-label="Sắp xếp"
          value={sortKey}
          onChange={(event) => setSortKey(event.target.value as ProgressSortKey)}
          className={SELECT_CLASSES}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ActionButton onClick={() => setDirection((current) => (current === "asc" ? "desc" : "asc"))}>
          <ArrowDownUp size={15} strokeWidth={1.8} aria-hidden="true" />
          {direction === "asc" ? "Tăng dần" : "Giảm dần"}
        </ActionButton>
      </div>
      <ListState
        // Switching class must not show the previous class while the next one loads or fails.
        isLoading={isLoading}
        error={error}
        isEmpty={rows.length === 0}
        emptyMessage={hasStudents ? "Không tìm thấy sinh viên phù hợp." : "Lớp chưa có sinh viên."}
        onRetry={reload}
      >
        <div className="grid gap-[10px] lg:grid-cols-2">
          {rows.map((student) => (
            <ProgressRow key={student.studentId} classId={classId} student={student} />
          ))}
        </div>
      </ListState>
    </div>
  );
}
