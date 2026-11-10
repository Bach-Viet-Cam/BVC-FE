import { CalendarOff } from "lucide-react";
import { type OverviewEmptyReason, type OverviewSemester } from "@/features/classes/types/teacherAssignmentTypes";
import { emptyReasonMessage } from "@/features/classes/utils/assignmentOverviewFormat";

interface SemesterEmptyNoticeProps {
  reason: OverviewEmptyReason;
  semester: OverviewSemester | null;
}

// Tells the lecturer why no class is listed: classes are always limited to the current semester.
export function SemesterEmptyNotice({ reason, semester }: SemesterEmptyNoticeProps) {
  return (
    <div
      role="status"
      className="flex items-start gap-[12px] rounded-bvc-xl border border-dashed border-bvc-border-strong bg-white p-[18px] text-[14px] text-bvc-muted"
    >
      <CalendarOff size={20} strokeWidth={1.8} className="mt-[1px] shrink-0" aria-hidden="true" />
      <span>{emptyReasonMessage(reason, { semester, today: new Date() })}</span>
    </div>
  );
}
