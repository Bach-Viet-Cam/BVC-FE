import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { formatDeadlineLine } from "@/features/classes/utils/myAssignmentGroups";
import { type AssignmentListItem } from "@/features/classes/types/assignmentTypes";
import { AssignmentKindTag } from "@/features/classes/components/AssignmentKindTag";
import { assignmentHref, assignmentKindOf } from "@/features/classes/utils/assignmentFormat";
import { actionButtonClass } from "@/shared/components/bvc/actionButtonStyles";

interface NextAssignmentCardProps {
  assignment: AssignmentListItem;
  now: Date;
}

export function NextAssignmentCard({ assignment, now }: NextAssignmentCardProps) {
  return (
    <section
      aria-label="Bài cần làm tiếp"
      className="flex flex-col gap-4 rounded-bvc-xl border border-bvc-accent-border bg-bvc-accent-tint p-5 md:flex-row md:items-center md:justify-between md:p-6"
    >
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-bvc-accent-text">
          Làm tiếp
          <AssignmentKindTag kind={assignmentKindOf(assignment)} className="bg-white/80" />
        </p>
        <h2 className="mt-1 font-bvc-display text-[22px] leading-tight font-semibold text-bvc-ink">
          {assignment.title}
        </h2>
        <p className="mt-2 text-[14px] text-bvc-ink/80 tabular-nums">
          {assignment.className} · {formatDeadlineLine(assignment.deadline, true, now)} · Chuẩn {assignment.minAccuracy}
          % · Lượt {assignment.usedSubmissions}/{assignment.maxSubmissions}
        </p>
      </div>
      <Link
        to={assignmentHref(assignment)}
        className={actionButtonClass("primary", "lg", "w-full hover:text-white md:w-auto")}
      >
        {assignment.usedSubmissions > 0 ? "Nộp lại" : "Luyện bài"}
        <ArrowRight size={16} aria-hidden />
      </Link>
    </section>
  );
}
