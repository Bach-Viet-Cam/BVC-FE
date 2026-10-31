import { ChevronRight } from "lucide-react";
import {
  ATTENTION_STATUS_LABELS,
  type AttentionStatus,
  type AttentionStudent,
} from "@/features/classes/utils/teacherHomeFormat";

const STATUS_DOTS: Record<AttentionStatus, string> = { AT_RISK: "bg-bvc-warn", BEHIND: "bg-bvc-error" };

interface AttentionStudentRowProps {
  student: AttentionStudent;
  onOpen: (student: AttentionStudent) => void;
}

// One student to watch; opens the student's submission history in the class.
export function AttentionStudentRow({ student, onOpen }: AttentionStudentRowProps) {
  return (
    <li className="border-b border-bvc-line last:border-0">
      <button
        type="button"
        onClick={() => onOpen(student)}
        className="flex min-h-[56px] w-full cursor-pointer items-center gap-3 px-[20px] py-[8px] text-left hover:bg-bvc-surface"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
          <span className="truncate text-[14px] font-semibold text-bvc-ink">{student.username}</span>
          <span className="truncate text-[12.5px] text-bvc-muted">
            {student.studentCode ? `${student.studentCode} · ` : ""}
            {student.className}
          </span>
        </div>
        <span className="flex shrink-0 items-center gap-[6px] whitespace-nowrap text-[12.5px] text-bvc-muted">
          <span className={`size-[7px] shrink-0 rounded-full ${STATUS_DOTS[student.status]}`} />
          {ATTENTION_STATUS_LABELS[student.status]}
        </span>
        <span className="w-[44px] shrink-0 text-right font-mono text-[13px] text-bvc-ink">
          {student.averageAccuracy === null ? "-" : `${student.averageAccuracy}%`}
        </span>
        <ChevronRight size={16} strokeWidth={1.8} className="shrink-0 text-bvc-muted" />
      </button>
    </li>
  );
}
