import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { AssignmentKindTag } from "@/features/classes/components/AssignmentKindTag";
import { StatusLabel } from "@/features/classes/components/StatusLabel";
import { type AssignmentListItem, type StudentAssignmentStatus } from "@/features/classes/types/assignmentTypes";
import {
  ASSIGNMENT_STATUS_META,
  assignmentHref,
  assignmentKindOf,
  getDeadlineUrgency,
} from "@/features/classes/utils/assignmentFormat";
import { formatDeadlineLine, getAssignmentBucket } from "@/features/classes/utils/myAssignmentGroups";
import { cn } from "@/shared/utils/cn";

const STATUS_TONE: Record<StudentAssignmentStatus, "ok" | "warn" | "muted"> = {
  PASSED: "ok",
  SUBMITTED: "muted",
  NOT_SUBMITTED: "muted",
  OVERDUE: "warn",
};

interface MyAssignmentCardProps {
  assignment: AssignmentListItem;
  now: Date;
}

export function MyAssignmentCard({ assignment, now }: MyAssignmentCardProps) {
  const isTodo = getAssignmentBucket(assignment, now) === "todo";
  const isUrgent = isTodo && getDeadlineUrgency(assignment.deadline, now) === "urgent";
  const actionLabel = !isTodo ? "Xem chi tiết" : assignment.usedSubmissions > 0 ? "Nộp lại" : "Luyện bài";

  return (
    <Link
      to={assignmentHref(assignment)}
      className={cn(
        "group flex min-h-[172px] flex-col rounded-bvc-lg border p-[18px] text-bvc-ink transition-colors hover:text-bvc-ink",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bvc-ink",
        isTodo
          ? "border-bvc-border-strong bg-white hover:border-bvc-accent"
          : "border-transparent bg-bvc-soft hover:border-bvc-border-strong"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2 text-[13px] text-bvc-muted">
          <AssignmentKindTag kind={assignmentKindOf(assignment)} />
          <span className="truncate">{assignment.className}</span>
        </span>
        <StatusLabel label={ASSIGNMENT_STATUS_META[assignment.status].label} tone={STATUS_TONE[assignment.status]} />
      </div>

      <h3 className="mt-3 line-clamp-2 font-bvc-display text-[17px] leading-snug font-semibold">{assignment.title}</h3>

      <p
        className={cn(
          "mt-2 text-[13.5px] tabular-nums",
          isUrgent ? "font-medium text-bvc-accent-text" : "text-bvc-muted"
        )}
      >
        {formatDeadlineLine(assignment.deadline, isTodo, now)}
      </p>

      <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-[13px]">
        <span className="text-bvc-muted tabular-nums">
          Chuẩn {assignment.minAccuracy}% · Lượt {assignment.usedSubmissions}/{assignment.maxSubmissions}
          {assignment.bonusPoints ? ` · +${assignment.bonusPoints} điểm` : ""}
        </span>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 font-medium",
            isTodo ? "text-bvc-accent" : "text-bvc-muted"
          )}
        >
          {actionLabel}
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
