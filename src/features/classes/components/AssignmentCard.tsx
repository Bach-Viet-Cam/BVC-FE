import { Link } from "react-router-dom";
import { StatusLabel } from "@/features/classes/components/StatusLabel";
import { type AssignmentListItem, type AssignmentStatus } from "@/features/classes/types/teacherAssignmentTypes";
import { ASSIGNMENT_KIND_LABELS, ASSIGNMENT_STATUS_LABELS } from "@/features/classes/utils/teacherAssignmentFormat";

interface AssignmentCardProps {
  assignment: AssignmentListItem;
}

const STATUS_TONES: Record<AssignmentStatus, "ok" | "warn" | "muted"> = {
  PUBLISHED: "ok",
  DRAFT: "warn",
  CLOSED: "muted",
};

export function AssignmentCard({ assignment }: AssignmentCardProps) {
  return (
    <Link
      to={`/teacher/assignments/${assignment.id}`}
      className="flex flex-col gap-[7px] rounded-[18px] border border-bvc-border p-[15px] text-bvc-ink"
    >
      <span className="flex justify-between gap-[10px]">
        <span className="text-[16px] font-bold">{assignment.title}</span>
        <StatusLabel label={ASSIGNMENT_STATUS_LABELS[assignment.status]} tone={STATUS_TONES[assignment.status]} />
      </span>
      <span className="flex flex-wrap items-center gap-[10px] text-[12.5px] text-bvc-muted">
        <span className="whitespace-nowrap rounded-[8px] bg-bvc-soft px-[9px] py-[4px] text-[11.5px] text-bvc-ink">
          {ASSIGNMENT_KIND_LABELS[assignment.kind]}
        </span>
        <span>{assignment.className}</span>
        <span>
          {assignment.submittedCount}/{assignment.memberCount} đã nộp
        </span>
      </span>
    </Link>
  );
}
