import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { FilterChips, MobileHeader, TagBadge } from "@/shared/components/bvc";
import { StudentTabBar } from "@/shared/components/StudentTabBar";
import { useMyAssignments } from "@/features/classes/hooks/useMyAssignments";
import { ASSIGNMENT_STATUS_META, formatShortDeadline } from "@/features/classes/utils/assignmentFormat";

const CHIPS = [
  { value: "all", label: "Tất cả" },
  { value: "NOT_SUBMITTED", label: "Chưa nộp" },
  { value: "SUBMITTED", label: "Đã nộp" },
  { value: "PASSED", label: "Đạt" },
  { value: "OVERDUE", label: "Quá hạn" },
];

export function MyAssignmentsPage() {
  const navigate = useNavigate();
  const { items, error, isLoading, searchText, setSearchText } = useMyAssignments("NON_BONUS");
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");

  const classes = Array.from(new Map(items.map((item) => [item.classId, item.className])).entries());
  const visible = items
    .filter((item) => statusFilter === "all" || item.status === statusFilter)
    .filter((item) => classFilter === "all" || item.classId === classFilter);

  return (
    <>
      <MobileHeader title="Bài tập của tôi" onBack={() => navigate("/home")} />

      <div className="flex shrink-0 flex-col gap-[10px] px-[14px] pb-[8px]">
        <div className="flex items-center gap-[8px]">
          <input
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Tìm theo tên bài tập"
            maxLength={100}
            className="h-[44px] min-w-0 flex-1 rounded-[14px] border border-bvc-border-strong bg-white px-[14px] text-[14px] text-bvc-ink placeholder:text-bvc-faint focus:outline-none"
          />
          <button
            type="button"
            onClick={() => navigate("/community/bonus")}
            className="shrink-0 cursor-pointer text-[13px] font-semibold text-bvc-accent-text"
          >
            Bài bonus
            <ChevronRight size={14} className="inline" />
          </button>
        </div>
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
        <FilterChips chips={CHIPS} active={statusFilter} onChange={setStatusFilter} />
      </div>

      <div className="flex-1 overflow-y-auto pt-3">
        {isLoading && <p className="px-[14px] text-[14px] text-bvc-muted">Đang tải...</p>}
        {!isLoading && error && <p className="px-[14px] text-[14px] text-bvc-error">{error}</p>}
        {!isLoading && !error && items.length === 0 && (
          <p className="px-[14px] pt-8 text-center text-[14px] text-bvc-muted">Bạn chưa có bài tập nào.</p>
        )}
        {!isLoading && !error && items.length > 0 && visible.length === 0 && (
          <p className="px-[14px] pt-8 text-center text-[14px] text-bvc-muted">Không tìm thấy bài tập phù hợp.</p>
        )}
        {!isLoading &&
          !error &&
          visible.map((assignment) => {
            const meta = ASSIGNMENT_STATUS_META[assignment.status];
            return (
              <button
                key={assignment.id}
                type="button"
                onClick={() => navigate(`/assignment/${assignment.id}`)}
                className="mx-[14px] mb-3 block w-[calc(100%-28px)] cursor-pointer rounded-[18px] border border-bvc-border p-[13px] text-left"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="flex-1 text-[14px] font-bold leading-snug text-bvc-ink">{assignment.title}</span>
                  <TagBadge label={meta.label} variant={meta.variant} />
                </div>
                <p className="mt-1 text-[12px] text-bvc-muted">
                  {assignment.className} · Hạn {formatShortDeadline(assignment.deadline)} · Lượt{" "}
                  {assignment.usedSubmissions}/{assignment.maxSubmissions}
                </p>
              </button>
            );
          })}
        <div className="h-4" />
      </div>
      <StudentTabBar />
    </>
  );
}
