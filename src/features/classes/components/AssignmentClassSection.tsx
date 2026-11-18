import { ChevronDown, ChevronRight } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { type OverviewAssignment, type OverviewClass } from "@/features/classes/types/teacherAssignmentTypes";
import { OVERVIEW_STATUS_LABELS, summarizeClass } from "@/features/classes/utils/assignmentOverviewFormat";
import { ASSIGNMENT_CLASS_PARAM, ASSIGNMENT_KIND_LABELS } from "@/features/classes/utils/teacherAssignmentFormat";
import { cn } from "@/shared/utils/cn";

interface AssignmentClassSectionProps {
  cls: OverviewClass;
  open: boolean;
  onToggle: () => void;
  highlightIds: Set<string>;
}

const COLUMNS = "lg:grid-cols-[2.9fr_1.4fr_1.4fr_1.3fr_1.1fr_24px]";

export function AssignmentClassSection({ cls, open, onToggle, highlightIds }: AssignmentClassSectionProps) {
  const summary = summarizeClass(cls);
  return (
    <section
      id={`class-${cls.id}`}
      className="shrink-0 overflow-hidden rounded-[20px] border border-bvc-border bg-white"
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="flex min-h-[72px] w-full cursor-pointer items-center gap-[14px] bg-white px-[16px] py-[10px] text-left text-bvc-ink max-lg:flex-wrap lg:px-[24px]"
      >
        <ChevronDown
          size={20}
          strokeWidth={2}
          aria-hidden="true"
          className={cn("shrink-0 transition-transform", !open && "-rotate-90")}
        />
        <span className="text-[18px] font-extrabold tracking-[-0.02em]">{cls.name}</span>
        <span className="text-[13.5px] text-bvc-muted">
          {`${cls.memberCount} SV · ${summary.assignmentCount} bài tập · ${summary.openCount} đang mở`}
        </span>
        <span className="grow" />
        <span className="flex items-baseline gap-[6px]">
          <span className="font-bvc-mono text-[15px] font-semibold">{summary.practiceCount}</span>
          <span className="text-[13px] text-bvc-muted">lượt luyện tập</span>
        </span>
      </button>
      {open &&
        (cls.assignments.length === 0 ? (
          <p className="border-t border-bvc-border px-[24px] py-[22px] text-[14px] text-bvc-muted">
            Lớp này chưa có bài tập nào.
          </p>
        ) : (
          <div>
            <div
              className={cn(
                "hidden items-center gap-[14px] border-y border-bvc-border bg-bvc-soft px-[24px] py-[12px] text-[12px] font-bold tracking-[0.08em] text-bvc-muted uppercase lg:grid",
                COLUMNS
              )}
            >
              <span>Bài tập</span>
              <span>Loại</span>
              <span>Đã luyện</span>
              <span>Luyện tập</span>
              <span>Trạng thái</span>
              <span />
            </div>
            {cls.assignments.map((assignment) => (
              <AssignmentRow key={assignment.id} assignment={assignment} isNew={highlightIds.has(assignment.id)} />
            ))}
          </div>
        ))}
    </section>
  );
}

function AssignmentRow({ assignment, isNew }: { assignment: OverviewAssignment; isNew: boolean }) {
  const isClosed = assignment.status === "CLOSED";
  const percent = assignment.memberCount ? Math.round((assignment.submittedCount / assignment.memberCount) * 100) : 0;
  // Keep ?class= so closing the detail drawer returns to the same class deep link.
  const [searchParams] = useSearchParams();
  const classId = searchParams.get(ASSIGNMENT_CLASS_PARAM);
  return (
    <Link
      to={{
        pathname: `/teacher/assignments/${assignment.id}`,
        search: classId ? `?${ASSIGNMENT_CLASS_PARAM}=${encodeURIComponent(classId)}` : "",
      }}
      className={cn(
        "grid items-center gap-x-[14px] gap-y-[8px] border-b border-bvc-line px-[16px] py-[12px] text-[14px] text-bvc-ink max-lg:grid-cols-2 lg:min-h-[64px] lg:px-[24px] lg:py-[10px]",
        COLUMNS,
        isNew && "bg-bvc-accent-tint"
      )}
    >
      <span className="flex min-w-0 flex-col gap-[2px] max-lg:col-span-2">
        <span className="flex items-center gap-[8px]">
          <span className={cn("text-[14.5px] font-semibold", isClosed && "text-bvc-muted")}>{assignment.title}</span>
          {isNew && (
            <span className="rounded-[8px] border border-bvc-accent-border bg-bvc-accent-tint px-[7px] py-[2px] text-[11px] font-bold text-bvc-accent-text">
              Vừa gán
            </span>
          )}
        </span>
        {assignment.sheetTitle && <span className="text-[12.5px] text-bvc-muted">{assignment.sheetTitle}</span>}
      </span>
      <span>{ASSIGNMENT_KIND_LABELS[assignment.kind]}</span>
      <span className="flex flex-col gap-[5px]">
        <span className="font-bvc-mono text-[13px]">{`${assignment.submittedCount} / ${assignment.memberCount} SV`}</span>
        <span className="block h-[6px] rounded-[3px] bg-bvc-surface">
          <span
            className={cn("block h-[6px] rounded-[3px]", isClosed ? "bg-bvc-bar-strong" : "bg-bvc-accent")}
            style={{ width: `${percent}%` }}
          />
        </span>
      </span>
      <span className="font-bvc-mono text-[13px] font-semibold">{`${assignment.practiceCount} lượt`}</span>
      <span
        className={cn(
          "flex items-center gap-[7px] text-[13.5px]",
          isClosed || assignment.status === "DRAFT" ? "text-bvc-muted" : "text-bvc-ink"
        )}
      >
        <span
          className={cn(
            "size-[7px] shrink-0 rounded-full",
            assignment.status === "PUBLISHED" ? "bg-bvc-dot-ok" : "bg-bvc-bar-strong"
          )}
        />
        {OVERVIEW_STATUS_LABELS[assignment.status]}
      </span>
      <ChevronRight size={18} strokeWidth={1.8} aria-hidden="true" className="text-bvc-faint max-lg:hidden" />
    </Link>
  );
}
