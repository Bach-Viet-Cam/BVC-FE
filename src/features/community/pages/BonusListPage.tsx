import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FilterChips, MobileHeader, TagBadge } from "@/shared/components/bvc";
import { useMyAssignments } from "@/features/classes/hooks/useMyAssignments";
import { type AssignmentListItem } from "@/features/classes/types/assignmentTypes";
import { ASSIGNMENT_STATUS_META, formatShortDeadline } from "@/features/classes/utils/assignmentFormat";

type BonusFilter = "open" | "done" | "expired";

const CHIPS = [
  { value: "all", label: "Tất cả" },
  { value: "open", label: "Đang mở" },
  { value: "done", label: "Đã làm" },
  { value: "expired", label: "Hết hạn" },
];

function matchesFilter(item: AssignmentListItem, filter: BonusFilter | "all", now: Date): boolean {
  if (filter === "all") return true;
  if (filter === "open") return new Date(item.deadline).getTime() >= now.getTime();
  if (filter === "done") return item.status === "PASSED" || item.status === "SUBMITTED";
  return item.status === "OVERDUE";
}

export function BonusListPage() {
  const navigate = useNavigate();
  const { items, error, isLoading, searchText, setSearchText } = useMyAssignments("BONUS");
  const [filter, setFilter] = useState<BonusFilter | "all">("open");
  const [classFilter, setClassFilter] = useState("all");

  const now = new Date();
  const classes = Array.from(new Map(items.map((item) => [item.classId, item.className])).entries());
  const visible = items
    .filter((item) => matchesFilter(item, filter, now))
    .filter((item) => classFilter === "all" || item.classId === classFilter);

  return (
    <>
      <MobileHeader title="Bài bonus" onBack={() => navigate("/assignments")} />
      <div className="flex shrink-0 flex-col gap-[10px] px-[14px] pb-[8px]">
        <input
          type="search"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Tìm theo tên bài bonus"
          maxLength={100}
          className="h-[44px] rounded-[14px] border border-bvc-border-strong bg-white px-[14px] text-[14px] text-bvc-ink placeholder:text-bvc-faint focus:outline-none"
        />
        {classes.length > 1 && (
          <select
            aria-label="Lớp"
            value={classFilter}
            onChange={(event) => setClassFilter(event.target.value)}
            className="h-[40px] rounded-[12px] border border-bvc-border-strong bg-white px-[12px] text-[13.5px] text-bvc-ink focus:outline-none"
          >
            <option value="all">Tất cả lớp</option>
            {classes.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="shrink-0 pb-[2px]">
        {/* giá trị chip luôn thuộc CHIPS nên ép kiểu về BonusFilter | "all" là an toàn */}
        <FilterChips chips={CHIPS} active={filter} onChange={(value) => setFilter(value as BonusFilter | "all")} />
      </div>

      <div className="flex-1 overflow-y-auto pt-3">
        {isLoading && <p className="px-[14px] text-[14px] text-bvc-muted">Đang tải...</p>}
        {!isLoading && error && <p className="px-[14px] text-[14px] text-bvc-error">{error}</p>}
        {!isLoading && !error && items.length === 0 && (
          <p className="px-[14px] pt-8 text-center text-[14px] text-bvc-muted">Bạn chưa có bài bonus nào.</p>
        )}
        {!isLoading && !error && items.length > 0 && visible.length === 0 && (
          <p className="px-[14px] pt-8 text-center text-[14px] text-bvc-muted">Không tìm thấy bài bonus phù hợp.</p>
        )}
        {!isLoading &&
          !error &&
          visible.map((item) => {
            const meta = ASSIGNMENT_STATUS_META[item.status];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(`/community/bonus/${item.id}`)}
                className="mx-[14px] mb-3 block w-[calc(100%-28px)] cursor-pointer rounded-[18px] border border-bvc-border p-[13px] text-left"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="flex-1 text-[14px] font-bold leading-snug text-bvc-ink">{item.title}</span>
                  <TagBadge label={meta.label} variant={meta.variant} />
                </div>
                <p className="mt-1 text-[12px] text-bvc-muted">
                  Accuracy từ {item.minAccuracy}%{item.bonusPoints !== null ? ` · +${item.bonusPoints} điểm` : ""} · Hạn{" "}
                  {formatShortDeadline(item.deadline)}
                </p>
              </button>
            );
          })}
        <div className="h-4" />
      </div>
    </>
  );
}
