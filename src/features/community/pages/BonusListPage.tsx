import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Search, X } from "lucide-react";
import { StudentShell } from "@/shared/components/bvc/StudentShell";
import { useMyAssignments } from "@/features/classes/hooks/useMyAssignments";
import { type AssignmentListItem } from "@/features/classes/types/assignmentTypes";
import { formatShortDeadline } from "@/features/classes/utils/assignmentFormat";
import { cn } from "@/shared/utils/cn";

type BonusFilter = "open" | "done" | "expired";

const TABS: { value: BonusFilter | "all"; label: string }[] = [
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
    <StudentShell>
      <div className="mx-auto flex w-full max-w-[1180px] flex-1 flex-col gap-4 px-3.5 py-4 sm:px-6 md:gap-6 md:px-10 md:py-8">
        {/* Header trang */}
        <div className="flex flex-col gap-2">
          <Link
            to="/assignments"
            className="group inline-flex items-center gap-1.5 self-start text-[13px] font-bold text-bvc-accent transition-colors hover:text-bvc-ink"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
            <span>Quay lại bài tập của tôi</span>
          </Link>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-bvc-display text-[22px] font-black tracking-tight text-bvc-ink sm:text-[26px]">
                Bài tập bonus
              </h1>
              <p className="text-[12.5px] text-bvc-muted sm:text-[13px]">
                Luyện thêm để nâng cao kỹ năng diễn tấu.
              </p>
            </div>
          </div>
        </div>

        {/* Bàn điều khiển: Tìm kiếm & Lọc gạch chân thanh lịch */}
        <div className="flex flex-col gap-3 rounded-2xl border border-bvc-border/80 bg-white p-3.5 shadow-2xs">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex min-w-0 flex-1 items-center">
              <Search size={15} className="absolute left-3 text-bvc-faint" />
              <input
                type="search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Tìm theo tên bài bonus..."
                maxLength={100}
                className="h-9.5 w-full rounded-xl border border-bvc-border bg-bvc-surface/40 pl-9 pr-8 text-[13px] text-bvc-ink placeholder:text-bvc-faint transition-colors focus:border-bvc-accent focus:bg-white focus:outline-none"
              />
              {searchText && (
                <button
                  type="button"
                  onClick={() => setSearchText("")}
                  aria-label="Xóa tìm kiếm"
                  className="absolute right-2.5 text-bvc-faint hover:text-bvc-ink"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {classes.length > 1 && (
              <select
                aria-label="Lớp"
                value={classFilter}
                onChange={(event) => setClassFilter(event.target.value)}
                className="h-9.5 cursor-pointer rounded-xl border border-bvc-border bg-bvc-surface/40 px-3 text-[12.5px] font-semibold text-bvc-ink focus:border-bvc-accent focus:bg-white focus:outline-none"
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

          {/* Underline Tabs (ZERO PILLS) */}
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar border-t border-bvc-line/70 pt-2.5">
            {TABS.map(({ value, label }) => {
              const isActive = filter === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={cn(
                    "group relative pb-2 pt-0.5 text-[13px] font-medium transition-colors shrink-0",
                    isActive ? "text-bvc-ink font-bold" : "text-bvc-muted hover:text-bvc-ink"
                  )}
                >
                  <span>{label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-bvc-accent" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Danh sách bài bonus */}
        <div className="flex-1 pb-10">
          {isLoading && (
            <div className="py-16 text-center text-[14px] text-bvc-muted">
              <span className="inline-block size-5 animate-spin rounded-full border-2 border-bvc-accent border-t-transparent" />
              <p className="mt-2.5 font-semibold">Đang tải danh sách bài bonus...</p>
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4 text-center text-[13.5px] font-semibold text-bvc-error">
              {error}
            </div>
          )}

          {!isLoading && !error && items.length === 0 && (
            <div className="rounded-2xl border border-bvc-border bg-white py-16 text-center text-[14px] text-bvc-muted shadow-2xs">
              Bạn chưa có bài bonus nào.
            </div>
          )}

          {!isLoading && !error && items.length > 0 && visible.length === 0 && (
            <div className="rounded-2xl border border-bvc-border bg-white py-16 text-center text-[14px] text-bvc-muted shadow-2xs">
              Không tìm thấy bài bonus phù hợp.
            </div>
          )}

          {!isLoading && !error && visible.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
              {visible.map((item) => {
                const isOverdue = item.status === "OVERDUE";
                const isPassed = item.status === "PASSED";
                const isSubmitted = item.status === "SUBMITTED";

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(`/community/bonus/${item.id}`)}
                    className="group flex flex-col justify-between rounded-2xl border border-bvc-border/80 bg-white p-5 text-left shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-bvc-accent/70 hover:bg-[#FAF9F6] hover:shadow-xs active:translate-y-0 active:scale-[0.99]"
                  >
                    <div>
                      {/* Eyebrow & Status Dot (NO PILLS) */}
                      <div className="flex items-center justify-between gap-2 text-[12px]">
                        <span className="font-medium text-bvc-muted">
                          {item.className} · Bonus
                        </span>

                        <div className="flex items-center gap-1.5 shrink-0 text-[11.5px] font-medium">
                          {isOverdue && (
                            <span className="flex items-center gap-1 font-semibold text-bvc-error">
                              <span className="size-1.5 rounded-full bg-bvc-error" />
                              <span>Quá hạn</span>
                            </span>
                          )}
                          {item.status === "NOT_SUBMITTED" && (
                            <span className="flex items-center gap-1 text-bvc-muted">
                              <span className="size-1.5 rounded-full bg-bvc-faint" />
                              <span>Chưa nộp</span>
                            </span>
                          )}
                          {isSubmitted && (
                            <span className="flex items-center gap-1 font-semibold text-bvc-accent">
                              <span className="size-1.5 rounded-full bg-bvc-accent" />
                              <span>Đã nộp</span>
                            </span>
                          )}
                          {isPassed && (
                            <span className="flex items-center gap-1 font-semibold text-bvc-ok">
                              <span className="size-1.5 rounded-full bg-bvc-ok" />
                              <span>Đạt</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <h2 className="mt-3 font-bvc-display text-[16px] font-bold leading-snug text-bvc-ink transition-colors group-hover:text-bvc-accent line-clamp-2">
                        {item.title}
                      </h2>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-bvc-line/70 pt-3 text-[12px]">
                      <span className={cn("font-medium", isOverdue ? "font-semibold text-bvc-error" : "text-bvc-muted")}>
                        Hạn: {formatShortDeadline(item.deadline)}
                      </span>

                      <span className="flex items-center gap-1 text-[11.5px] font-bold text-bvc-accent transition-transform group-hover:translate-x-0.5">
                        <span>Luyện bài</span>
                        <ArrowRight size={12} />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </StudentShell>
  );
}
