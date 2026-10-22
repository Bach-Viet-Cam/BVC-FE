import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ActionButton } from "@/features/classes/components/ActionButton";
import { INPUT_CLASSES } from "@/features/classes/components/FormField";
import { ListState } from "@/features/classes/components/ListState";
import { HISTORY_PAGE_LIMIT, useStudentHistory } from "@/features/classes/hooks/useStudentHistory";
import { type HistoryItem } from "@/features/classes/types/teacherProgressTypes";
import {
  ASSIGNMENT_KIND_LABELS,
  SUBMISSION_STATUS_LABELS,
  formatPercent,
  formatVietnamDateTime,
} from "@/features/classes/utils/teacherAssignmentFormat";
import { maskDateInput, parseVietnameseDate } from "@/features/classes/utils/classFormat";

interface PracticeHistoryProps {
  classId: string;
  studentId: string;
}

type HistorySort = "newest" | "oldest" | "accuracy";

const SORT_OPTIONS: Array<{ value: HistorySort; label: string }> = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "accuracy", label: "Độ chính xác" },
];
const INVALID_DATE = "Ngày không hợp lệ. Nhập theo dạng dd/mm/yyyy.";
const FROM_AFTER_TO = "Từ ngày không được sau đến ngày.";

// Newest first comes from the API; the other orders are applied to the loaded page. No accuracy goes last.
function sortHistory(items: HistoryItem[], sort: HistorySort): HistoryItem[] {
  if (sort === "newest") return items;
  if (sort === "oldest") return [...items].reverse();
  return [...items].sort((first, second) => (second.accuracy ?? -1) - (first.accuracy ?? -1));
}

// Date range "Từ – đến" (dd/mm/yyyy). An invalid range keeps the previous result and shows the message (spec §4).
export function PracticeHistory({ classId, studentId }: PracticeHistoryProps) {
  const [fromText, setFromText] = useState("");
  const [toText, setToText] = useState("");
  const [range, setRange] = useState<{ from?: string; to?: string }>({});
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [sort, setSort] = useState<HistorySort>("newest");
  const { history, isLoading, error, reload } = useStudentHistory(classId, studentId, range);
  const items = useMemo(() => sortHistory(history?.items ?? [], sort), [history, sort]);

  const applyFilter = () => {
    const from = fromText ? parseVietnameseDate(fromText) : undefined;
    const to = toText ? parseVietnameseDate(toText) : undefined;
    if (from === null || to === null) return setRangeError(INVALID_DATE);
    if (from && to && from > to) return setRangeError(FROM_AFTER_TO);
    setRangeError(null);
    setRange({ ...(from && { from }), ...(to && { to }) });
  };

  const dateInput = (id: string, label: string, value: string, onChange: (value: string) => void) => (
    <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
      <label htmlFor={id} className="text-[12.5px] font-semibold">
        {label}
      </label>
      <input
        id={id}
        inputMode="numeric"
        placeholder="dd/mm/yyyy"
        value={value}
        aria-invalid={rangeError ? true : undefined}
        onChange={(event) => onChange(maskDateInput(event.target.value))}
        className={INPUT_CLASSES}
      />
    </div>
  );

  return (
    <section className="flex flex-col gap-[10px]">
      <h2 className="m-0 text-[17px] font-bold">Lịch sử luyện tập</h2>
      <div className="flex items-end gap-[8px]">
        {dateInput("history-from", "Từ", fromText, setFromText)}
        {dateInput("history-to", "đến", toText, setToText)}
        <ActionButton onClick={applyFilter}>Lọc</ActionButton>
      </div>
      {rangeError && (
        <span role="alert" className="text-[12px] text-bvc-error">
          {rangeError}
        </span>
      )}
      <select
        aria-label="Sắp xếp"
        value={sort}
        onChange={(event) => setSort(event.target.value as HistorySort)}
        className="h-[44px] self-start rounded-[22px] border border-bvc-border-strong bg-white px-[12px] text-[13px] text-bvc-ink"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ListState
        // A new range must not leave the previous rows looking like its result (only MSG-04 keeps them).
        isLoading={isLoading}
        error={error}
        isEmpty={items.length === 0}
        emptyMessage="Chưa có bài nộp nào."
        onRetry={reload}
      >
        <ul className="m-0 grid list-none gap-[8px] p-0 lg:grid-cols-2">
          {items.map((item) => (
            <li
              key={item.submissionId}
              className="flex items-center gap-[10px] rounded-[16px] border border-bvc-border px-[13px] py-[11px]"
            >
              <span className="flex min-w-0 grow flex-col gap-[3px]">
                <span className="truncate text-[14px] font-bold">{item.assignmentTitle}</span>
                <span className="flex flex-wrap gap-x-[8px] text-[12px] text-bvc-muted">
                  <span>{ASSIGNMENT_KIND_LABELS[item.kind]}</span>
                  <span>{SUBMISSION_STATUS_LABELS[item.status]}</span>
                  {item.accuracy !== null && <span className="text-bvc-ink">{formatPercent(item.accuracy)}</span>}
                  <span>{formatVietnamDateTime(item.submittedAt)}</span>
                </span>
              </span>
              <Link
                to={`/teacher/assignments/${item.assignmentId}/students/${studentId}`}
                className="shrink-0 rounded-[18px] border border-bvc-border-strong px-[13px] py-[8px] text-[13px] font-semibold text-bvc-ink"
              >
                Xem
              </Link>
            </li>
          ))}
        </ul>
        {history && history.pagination.total > history.items.length && (
          <p className="m-0 text-[12px] text-bvc-muted">
            Hiển thị {HISTORY_PAGE_LIMIT} bài nộp mới nhất trong {history.pagination.total} bài. Thu hẹp khoảng ngày để
            xem các bài cũ hơn.
          </p>
        )}
      </ListState>
    </section>
  );
}
