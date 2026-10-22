import { Link } from "react-router-dom";
import { StatusLabel } from "@/features/classes/components/StatusLabel";
import { type ProgressStudent } from "@/features/classes/types/teacherProgressTypes";
import { PROGRESS_STATUS_LABELS, PROGRESS_STATUS_TONES, formatProgressSummary } from "@/features/classes/utils/progressFormat";

interface ProgressRowProps {
  classId: string;
  student: ProgressStudent;
}

export function ProgressRow({ classId, student }: ProgressRowProps) {
  return (
    <Link
      to={`/teacher/classes/${classId}/students/${student.studentId}`}
      className="flex flex-col gap-[6px] rounded-[18px] border border-bvc-border px-[14px] py-[13px] text-bvc-ink"
    >
      <span className="flex justify-between gap-[10px]">
        <span className="flex min-w-0 flex-col gap-[2px]">
          <span data-testid="progress-row-name" className="text-[15px] font-bold">
            {student.fullName}
          </span>
          <span className="font-bvc-mono text-[12px] text-bvc-muted">{student.studentCode ?? "—"}</span>
        </span>
        {student.status ? (
          <StatusLabel label={PROGRESS_STATUS_LABELS[student.status]} tone={PROGRESS_STATUS_TONES[student.status]} className="text-[12px]" />
        ) : (
          <span className="text-[13px] text-bvc-muted">-</span>
        )}
      </span>
      <span className="text-[12.5px] text-bvc-muted">{formatProgressSummary(student)}</span>
    </Link>
  );
}
