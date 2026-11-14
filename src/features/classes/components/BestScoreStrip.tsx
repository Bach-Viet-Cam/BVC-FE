import { ASSIGNMENT_KIND_LABELS, formatPercent } from "@/features/classes/utils/teacherAssignmentFormat";
import type { StudentStatsAssignment } from "@/features/practice/types/studentStatsTypes";
import { cn } from "@/shared/utils/cn";

interface BestScoreStripProps {
  assignments: StudentStatsAssignment[];
  selectedAssignmentId: string | null;
  // Bấm lại thẻ đang chọn thì bỏ lọc
  onSelect: (assignmentId: string | null) => void;
}

// Điểm cao nhất của từng bài; bấm thẻ để lọc đồ thị và lịch sử về bài đó
export function BestScoreStrip({ assignments, selectedAssignmentId, onSelect }: BestScoreStripProps) {
  return (
    <div role="group" aria-label="Điểm cao nhất" className="grid gap-[10px] sm:grid-cols-2 xl:grid-cols-4">
      {assignments.map((assignment) => {
        const isActive = assignment.id === selectedAssignmentId;
        return (
          <button
            key={assignment.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(isActive ? null : assignment.id)}
            className={cn(
              "flex cursor-pointer flex-col gap-1 rounded-bvc-xl border bg-white p-4 text-left transition-colors",
              isActive ? "border-bvc-accent-border bg-bvc-accent-tint" : "border-bvc-border hover:border-bvc-border-strong"
            )}
          >
            <span className="truncate text-[12px] font-medium text-bvc-muted">
              {ASSIGNMENT_KIND_LABELS[assignment.kind]} · {assignment.title}
            </span>
            <span className="font-bvc-display text-[26px] leading-tight font-semibold text-bvc-ink">
              {assignment.bestAccuracy === null ? "-" : formatPercent(assignment.bestAccuracy)}
            </span>
            <span className="text-[12px] text-bvc-muted">{assignment.attemptCount} lần nộp</span>
          </button>
        );
      })}
    </div>
  );
}
