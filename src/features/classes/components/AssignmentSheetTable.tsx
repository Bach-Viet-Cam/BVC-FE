import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { type SheetGroup } from "@/features/classes/utils/assignmentOverviewFormat";
import { ASSIGNMENT_KIND_LABELS } from "@/features/classes/utils/teacherAssignmentFormat";
import { cn } from "@/shared/utils/cn";

interface AssignmentSheetTableProps {
  groups: SheetGroup[];
}

const COLUMNS = "lg:grid-cols-[3fr_1.6fr_2fr_1.6fr_1.3fr_1.3fr_24px]";
const CHIP = "rounded-[8px] px-[8px] py-[2px] text-[12px] font-semibold";

// Assignments that share a sheet music are merged into one row, whatever their own settings.
export function AssignmentSheetTable({ groups }: AssignmentSheetTableProps) {
  const assignmentCount = groups.reduce((total, group) => total + group.assignments.length, 0);
  return (
    <section className="shrink-0 overflow-hidden rounded-[20px] border border-bvc-border bg-white">
      <div className="flex flex-wrap items-center gap-x-[14px] gap-y-[4px] px-[16px] py-[18px] lg:px-[24px]">
        <h2 className="text-[18px] font-extrabold tracking-[-0.02em]">Bài tập theo sheet nhạc</h2>
        <span className="text-[13.5px] text-bvc-muted">{`${groups.length} sheet nhạc · ${assignmentCount} bài tập`}</span>
        <span className="grow" />
        <span className="text-[13px] text-bvc-muted">
          Các bài tập dùng chung một sheet được gộp thành một dòng, không phân biệt cấu hình riêng của từng bài.
        </span>
      </div>
      {groups.length === 0 ? (
        <p className="border-t border-bvc-border px-[24px] py-[22px] text-[14px] text-bvc-muted">
          Chưa có bài tập nào gắn sheet nhạc.
        </p>
      ) : (
        <div>
          <div
            className={cn(
              "hidden items-center gap-[14px] border-y border-bvc-border bg-bvc-soft px-[24px] py-[12px] text-[12px] font-bold tracking-[0.08em] text-bvc-muted uppercase lg:grid",
              COLUMNS
            )}
          >
            <span>Sheet nhạc</span>
            <span>Loại bài</span>
            <span>Bài tập dùng sheet</span>
            <span>Giao cho lớp</span>
            <span>Đã luyện</span>
            <span>Luyện tập</span>
            <span />
          </div>
          {groups.map((group) => (
            <SheetRow key={group.sheetMusicId} group={group} />
          ))}
        </div>
      )}
    </section>
  );
}

function SheetRow({ group }: { group: SheetGroup }) {
  const percent = group.memberCount ? Math.round((group.submittedCount / group.memberCount) * 100) : 0;
  return (
    <Link
      to={`/teacher/assignments/${group.assignments[0].id}`}
      className={cn(
        "grid items-center gap-x-[14px] gap-y-[10px] border-b border-bvc-line px-[16px] py-[12px] text-[14px] text-bvc-ink max-lg:grid-cols-1 lg:px-[24px]",
        COLUMNS
      )}
    >
      <span className="flex min-w-0 items-center gap-[14px]">
        <ScoreIcon />
        <span className="flex min-w-0 flex-col gap-[2px]">
          <span className="text-[15px] font-bold">{group.sheetTitle}</span>
          <span className="text-[12.5px] text-bvc-muted">{`${group.assignments.length} bài tập`}</span>
        </span>
      </span>
      <span className="flex flex-wrap gap-[6px]">
        {group.kinds.map((kind) => (
          <span key={kind} className={cn(CHIP, "border border-bvc-border bg-bvc-soft")}>
            {ASSIGNMENT_KIND_LABELS[kind]}
          </span>
        ))}
      </span>
      <span className="flex min-w-0 flex-col gap-[3px]">
        <span className="font-bold">{`${group.assignments.length} bài tập`}</span>
        <span className="truncate text-[12.5px] text-bvc-muted">
          {group.assignments.map((assignment) => assignment.title).join(", ")}
        </span>
      </span>
      <span className="flex flex-wrap gap-[6px]">
        {group.classNames.map((name) => (
          <span key={name} className={cn(CHIP, "bg-bvc-surface text-[11.5px]")}>
            {name}
          </span>
        ))}
      </span>
      <span className="flex flex-col gap-[5px]">
        <span className="font-bvc-mono text-[13px]">{`${group.submittedCount} / ${group.memberCount} SV`}</span>
        <span className="block h-[6px] rounded-[3px] bg-bvc-surface">
          <span className="block h-[6px] rounded-[3px] bg-bvc-accent" style={{ width: `${percent}%` }} />
        </span>
      </span>
      <span className="font-bvc-mono text-[13px] font-semibold">{`${group.practiceCount} lượt`}</span>
      <ChevronRight size={18} strokeWidth={1.8} aria-hidden="true" className="text-bvc-faint max-lg:hidden" />
    </Link>
  );
}

// Decorative mini score, as in the mockup (no real sheet thumbnail).
function ScoreIcon() {
  return (
    <span
      aria-hidden="true"
      className="relative block h-[52px] w-[40px] shrink-0 rounded-[4px] border border-bvc-border-strong bg-white shadow-sm"
    >
      {[14, 19, 24, 29, 34].map((top) => (
        <span key={top} className="absolute right-[5px] left-[5px] h-px bg-bvc-bar-strong" style={{ top }} />
      ))}
      <span className="absolute top-[25px] left-[12px] h-[5px] w-[6px] rounded-full bg-bvc-ink" />
      <span className="absolute top-[20px] left-[24px] h-[5px] w-[6px] rounded-full bg-bvc-ink" />
    </span>
  );
}
