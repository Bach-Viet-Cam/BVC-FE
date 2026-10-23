import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Award,
  BookOpen,
  ChevronRight,
  LayoutGrid,
  List as ListIcon,
  Mic,
  Music2,
  Search,
  X,
} from "lucide-react";
import { StudentShell } from "@/shared/components/bvc/StudentShell";
import { useMyAssignments } from "@/features/classes/hooks/useMyAssignments";
import {
  ASSIGNMENT_TYPE_LABELS,
  formatShortDeadline,
} from "@/features/classes/utils/assignmentFormat";
import { type AssignmentListItem, type AssignmentType } from "@/features/classes/types/assignmentTypes";
import { cn } from "@/shared/utils/cn";

// Icon đại diện cho từng phân loại bài học âm nhạc
function AssignmentTypeIcon({
  type,
  size = 14,
  className,
  strokeWidth = 2,
}: {
  type: AssignmentType;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  switch (type) {
    case "RHYTHM":
      return <Activity size={size} className={className} strokeWidth={strokeWidth} />;
    case "RECORDING":
      return <Mic size={size} className={className} strokeWidth={strokeWidth} />;
    case "PRACTICE":
      return <Music2 size={size} className={className} strokeWidth={strokeWidth} />;
    case "EXAM":
      return <Award size={size} className={className} strokeWidth={strokeWidth} />;
    case "SHEET":
      return <BookOpen size={size} className={className} strokeWidth={strokeWidth} />;
    case "BONUS":
      return <Award size={size} className={className} strokeWidth={strokeWidth} />;
    default:
      return <Music2 size={size} className={className} strokeWidth={strokeWidth} />;
  }
}

export function MyAssignmentsPage() {
  const navigate = useNavigate();
  const { items, error, isLoading, searchText, setSearchText } = useMyAssignments("NON_BONUS");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const classes = Array.from(new Map(items.map((item) => [item.classId, item.className])).entries());

  const counts = useMemo(() => {
    const scoped = items.filter((item) => classFilter === "all" || item.classId === classFilter);
    return {
      all: scoped.length,
      NOT_SUBMITTED: scoped.filter((item) => item.status === "NOT_SUBMITTED").length,
      SUBMITTED: scoped.filter((item) => item.status === "SUBMITTED").length,
      PASSED: scoped.filter((item) => item.status === "PASSED").length,
      OVERDUE: scoped.filter((item) => item.status === "OVERDUE").length,
    };
  }, [items, classFilter]);


  // Tabs gạch chân thanh lịch, loại bỏ hoàn toàn giao diện bong bóng pills
  const statusTabs = [
    { value: "all", label: "Tất cả", count: counts.all },
    { value: "NOT_SUBMITTED", label: "Chưa nộp", count: counts.NOT_SUBMITTED },
    { value: "SUBMITTED", label: "Đã nộp", count: counts.SUBMITTED },
    { value: "PASSED", label: "Đạt", count: counts.PASSED },
    { value: "OVERDUE", label: "Quá hạn", count: counts.OVERDUE },
  ];

  const typeFilters: { value: string; label: string }[] = [
    { value: "all", label: "Tất cả loại bài" },
    { value: "RECORDING", label: "Thu âm diễn tấu" },
    { value: "RHYTHM", label: "Tiết tấu nhịp phách" },
    { value: "PRACTICE", label: "Luyện ngón" },
    { value: "EXAM", label: "Kiểm tra" },
  ];

  const visible = useMemo(() => {
    return items
      .filter((item) => statusFilter === "all" || item.status === statusFilter)
      .filter((item) => typeFilter === "all" || item.type === typeFilter)
      .filter((item) => classFilter === "all" || item.classId === classFilter);
  }, [items, statusFilter, typeFilter, classFilter]);

  return (
    <StudentShell>
      <div className="mx-auto flex w-full max-w-[1220px] flex-1 flex-col gap-5 px-3.5 py-4 sm:px-6 md:gap-6 md:px-10 md:py-8">
        {/* ── HEADER KHÔNG GIAN BÀI HỌC ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[12px] font-medium text-bvc-accent">
              <span>Học kỳ TRD301</span>
              <span className="text-bvc-line">·</span>
              <span>Khoa Nhạc cụ truyền thống</span>
            </div>

            <h1 className="mt-1 font-bvc-display text-[26px] font-black tracking-tight text-bvc-ink sm:text-[30px]">
              Bài tập của tôi
            </h1>
            <p className="mt-1 text-[13.5px] text-bvc-muted">
              Theo dõi hạn nộp, luyện tập và hoàn thành các bài tập được giao.
            </p>
          </div>

          {/* Nút Bài Bonus nổi bật theo màu thương hiệu BVC */}
          <button
            type="button"
            onClick={() => navigate("/community/bonus")}
            className="group inline-flex shrink-0 items-center gap-2 self-start rounded-xl bg-bvc-accent px-4 py-2.5 text-[13px] font-bold text-white shadow-2xs transition-all hover:bg-bvc-ink hover:shadow-xs active:scale-[0.98]"
          >
            <Award size={16} strokeWidth={2.2} className="text-white/90" />
            <span>Bài bonus</span>
            <ChevronRight size={14} className="text-white/80 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* ── BÀN ĐIỀU KHIỂN & BỘ LỌC (SEARCH & UNDERLINE TABS) ── */}
        <div className="flex flex-col gap-3 rounded-2xl border border-bvc-border/80 bg-white p-3.5 shadow-2xs">
          {/* Hàng 1: Search input + Select Loại bài + Lớp + Chuyển View Mode */}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex min-w-0 flex-1 items-center">
              <Search size={15} className="absolute left-3 text-bvc-faint" />
              <input
                type="search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Tìm theo tên bài tập..."
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

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {classes.length > 1 && (
                <select
                  aria-label="Lớp học"
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

              <select
                aria-label="Phân loại bài tập"
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="h-9.5 cursor-pointer rounded-xl border border-bvc-border bg-bvc-surface/40 px-3 text-[12.5px] font-semibold text-bvc-ink focus:border-bvc-accent focus:bg-white focus:outline-none"
              >
                {typeFilters.map((tf) => (
                  <option key={tf.value} value={tf.value}>
                    {tf.label}
                  </option>
                ))}
              </select>

              {/* Chuyển View Mode Grid / List */}
              <div className="flex items-center rounded-xl border border-bvc-border bg-bvc-surface/60 p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  aria-label="Xem dạng lưới"
                  className={cn(
                    "flex size-8.5 items-center justify-center rounded-lg transition-colors",
                    viewMode === "grid" ? "bg-white text-bvc-ink shadow-2xs font-bold" : "text-bvc-muted hover:text-bvc-ink"
                  )}
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  aria-label="Xem dạng danh sách"
                  className={cn(
                    "flex size-8.5 items-center justify-center rounded-lg transition-colors",
                    viewMode === "list" ? "bg-white text-bvc-ink shadow-2xs font-bold" : "text-bvc-muted hover:text-bvc-ink"
                  )}
                >
                  <ListIcon size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Hàng 2: Underline Tabs gạch chân tối giản (ZERO PILLS) */}
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar border-t border-bvc-line/70 pt-2.5">
            {statusTabs.map((tab) => {
              const isActive = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setStatusFilter(tab.value)}
                  className={cn(
                    "group relative flex shrink-0 items-center gap-1.5 pb-2 pt-0.5 text-[13px] font-medium transition-colors",
                    isActive ? "text-bvc-ink font-bold" : "text-bvc-muted hover:text-bvc-ink"
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      "font-bvc-mono text-[11px]",
                      isActive ? "text-bvc-accent font-bold" : "text-bvc-faint group-hover:text-bvc-muted"
                    )}
                  >
                    {tab.count}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-bvc-accent" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── DANH SÁCH BÀI TẬP ── */}
        <div className="flex-1 pb-10">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center text-bvc-muted">
              <span className="size-6 animate-spin rounded-full border-2 border-bvc-accent border-t-transparent" />
              <p className="mt-3 font-semibold text-[14px]">Đang tải danh sách bài tập...</p>
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-2xl border border-bvc-border bg-bvc-surface/60 p-6 text-center text-[14px] font-semibold text-bvc-error">
              {error}
            </div>
          )}

          {!isLoading && !error && items.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-bvc-border bg-white py-20 text-center shadow-2xs">
              <BookOpen size={40} className="text-bvc-faint mb-3" strokeWidth={1.5} />
              <p className="font-bvc-display text-[18px] font-bold text-bvc-ink">Bạn chưa có bài tập nào</p>
              <p className="mt-1 text-[13px] text-bvc-muted">Các bài luyện ngón, tiết tấu và thu âm giảng viên giao sẽ hiện ở đây.</p>
            </div>
          )}

          {!isLoading && !error && items.length > 0 && visible.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-bvc-border bg-white py-16 text-center shadow-2xs">
              <Search size={36} className="text-bvc-faint mb-2.5" strokeWidth={1.5} />
              <p className="font-bvc-display text-[17px] font-bold text-bvc-ink">Không tìm thấy bài tập phù hợp</p>
              <p className="mt-1 text-[13px] text-bvc-muted">Thử thay đổi từ khóa hoặc bộ lọc trạng thái phía trên.</p>
            </div>
          )}

          {/* DẠNG GRID CARD (PILL-FREE SCORE FOLIO) */}
          {!isLoading && !error && visible.length > 0 && viewMode === "grid" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
              {visible.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onSelect={() => navigate(`/assignment/${assignment.id}`)}
                />
              ))}
            </div>
          )}

          {/* DẠNG LIST VIEW (BẢNG HÀNG CHI TIẾT) */}
          {!isLoading && !error && visible.length > 0 && viewMode === "list" && (
            <div className="overflow-hidden rounded-2xl border border-bvc-border bg-white shadow-2xs">
              <div className="divide-y divide-bvc-line">
                {visible.map((assignment) => (
                  <AssignmentListItemRow
                    key={assignment.id}
                    assignment={assignment}
                    onSelect={() => navigate(`/assignment/${assignment.id}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </StudentShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: THẺ BÀI TẬP (SCORE CARD) THANH LỊCH — HOÀN TOÀN KHÔNG DÙNG PILLS
// ─────────────────────────────────────────────────────────────────────────────

interface AssignmentCardProps {
  assignment: AssignmentListItem;
  onSelect: () => void;
}

function AssignmentCard({ assignment, onSelect }: AssignmentCardProps) {
  const isOverdue = assignment.status === "OVERDUE";
  const isPassed = assignment.status === "PASSED";
  const isSubmitted = assignment.status === "SUBMITTED";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white p-5 text-left transition-all duration-200",
        "border-bvc-border/80 shadow-2xs hover:-translate-y-0.5 hover:border-bvc-accent/70 hover:bg-[#FAF9F6] hover:shadow-xs",
        "active:translate-y-0 active:scale-[0.99]"
      )}
    >
      {/* Hoa văn chìm nhạc cụ dân tộc (Watermark Motif) */}
      <div className="pointer-events-none absolute -bottom-6 -right-6 size-24 opacity-[0.03] transition-opacity group-hover:opacity-[0.07]">
        <AssignmentTypeIcon type={assignment.type} size={96} className="text-bvc-ink" />
      </div>

      <div>
        {/* Hàng 1: Metadata học phần + Trạng thái dạng Dot thanh thoát (ZERO PILLS) */}
        <div className="flex items-center justify-between gap-2 text-[12px]">
          {/* Eyebrow: Lớp & Loại bài */}
          <div className="flex items-center gap-1.5 text-bvc-muted">
            <AssignmentTypeIcon type={assignment.type} size={13} className="text-bvc-accent shrink-0" strokeWidth={2.2} />
            <span className="font-semibold text-bvc-ink/90">{assignment.className}</span>
            <span className="text-bvc-line">·</span>
            <span>{ASSIGNMENT_TYPE_LABELS[assignment.type] || "Bài tập"}</span>
          </div>

          {/* Trạng thái hiển thị bằng chấm màu tinh tế (Chấm + Chữ, không đóng khung Pill) */}
          <div className="flex items-center gap-1.5 shrink-0 text-[11.5px] font-medium">
            {isOverdue && (
              <span className="flex items-center gap-1 font-semibold text-bvc-error">
                <span className="size-1.5 rounded-full bg-bvc-error" />
                <span>Quá hạn</span>
              </span>
            )}
            {assignment.status === "NOT_SUBMITTED" && (
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

        {/* Tiêu đề bài tập */}
        <h2 className="mt-3 font-bvc-display text-[16px] font-bold leading-snug text-bvc-ink transition-colors group-hover:text-bvc-accent line-clamp-2">
          {assignment.title}
        </h2>

        {/* Thước đo chuẩn mực diễn tấu (Musical Measure Gauge) */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11.5px] text-bvc-muted">
            <span>
              Chuẩn đạt: <strong className="font-semibold text-bvc-ink">≥ {assignment.minAccuracy}%</strong>
            </span>
            <span className="font-bvc-mono text-bvc-muted">
              {assignment.usedSubmissions}/{assignment.maxSubmissions} lượt nộp
            </span>
          </div>

          {/* Vạch đo nhịp mỏng như dây đàn */}
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-bvc-line/70">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                isPassed ? "bg-bvc-ok" : isOverdue && assignment.usedSubmissions === 0 ? "bg-red-300" : "bg-bvc-accent"
              )}
              style={{
                width: `${Math.max(6, (assignment.usedSubmissions / assignment.maxSubmissions) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Chân thẻ: Hạn nộp & Tương tác */}
      <div className="mt-4 border-t border-bvc-line/70 pt-3">
        <div className="flex items-center justify-between text-[12px]">
          <span
            className={cn(
              "font-medium",
              isOverdue ? "font-semibold text-bvc-error" : "text-bvc-muted"
            )}
          >
            Hạn: {formatShortDeadline(assignment.deadline)}
          </span>

          <span className="flex items-center gap-1 text-[11.5px] font-bold text-bvc-accent transition-transform group-hover:translate-x-0.5">
            <span>Luyện bài</span>
            <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: DÒNG BÀI TẬP (LIST ROW) — KHÔNG DÙNG PILLS
// ─────────────────────────────────────────────────────────────────────────────

interface AssignmentListItemRowProps {
  assignment: AssignmentListItem;
  onSelect: () => void;
}

function AssignmentListItemRow({ assignment, onSelect }: AssignmentListItemRowProps) {
  const isOverdue = assignment.status === "OVERDUE";
  const isPassed = assignment.status === "PASSED";
  const isSubmitted = assignment.status === "SUBMITTED";

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex w-full flex-col gap-2.5 p-4 text-left transition-colors hover:bg-bvc-surface/40 sm:flex-row sm:items-center sm:justify-between sm:gap-4 md:px-5"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-bvc-surface text-bvc-accent">
          <AssignmentTypeIcon type={assignment.type} size={16} strokeWidth={2} />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate font-bvc-display text-[15px] font-bold text-bvc-ink group-hover:text-bvc-accent transition-colors">
              {assignment.title}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-bvc-muted mt-0.5">
            <span className="font-medium text-bvc-ink/80">{assignment.className}</span>
            <span className="text-bvc-line">·</span>
            <span>{ASSIGNMENT_TYPE_LABELS[assignment.type] || "Bài tập"}</span>
            <span className="text-bvc-line">·</span>
            <span>Chuẩn ≥ {assignment.minAccuracy}%</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 mt-1 sm:mt-0 text-[12px]">
        <span className={cn("font-medium", isOverdue ? "font-semibold text-bvc-error" : "text-bvc-muted")}>
          Hạn {formatShortDeadline(assignment.deadline)}
        </span>

        <span className="font-bvc-mono text-[11.5px] text-bvc-muted">
          {assignment.usedSubmissions}/{assignment.maxSubmissions} lượt
        </span>

        <div className="flex items-center gap-1.5 min-w-[70px] justify-end text-[11.5px] font-medium">
          {isOverdue && (
            <span className="flex items-center gap-1 font-semibold text-bvc-error">
              <span className="size-1.5 rounded-full bg-bvc-error" />
              <span>Quá hạn</span>
            </span>
          )}
          {assignment.status === "NOT_SUBMITTED" && (
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

        <ArrowRight size={14} className="text-bvc-muted opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
      </div>
    </button>
  );
}
