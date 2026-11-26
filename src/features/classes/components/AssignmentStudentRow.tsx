import { Link } from "react-router-dom";
import { StatusLabel } from "@/features/classes/components/StatusLabel";
import { type AssignmentStudent, type StudentAssignmentStatus } from "@/features/classes/types/teacherAssignmentTypes";
import { STUDENT_STATUS_LABELS, formatStudentSummary } from "@/features/classes/utils/teacherAssignmentFormat";

interface AssignmentStudentRowProps {
  // Drill-down page with the student's submissions (assignment or challenge)
  href: string;
  student: AssignmentStudent;
  // Extra context shown after the student code, e.g. the class in a multi-class challenge
  detail?: string;
}

const STATUS_TONES: Record<StudentAssignmentStatus, "ok" | "warn" | "muted"> = {
  PASSED: "ok",
  SUBMITTED: "warn",
  NOT_SUBMITTED: "muted",
};

export function AssignmentStudentRow({ href, student, detail }: AssignmentStudentRowProps) {
  return (
    <Link
      to={href}
      className="flex flex-col gap-[6px] rounded-bvc-xl border border-bvc-border px-[14px] py-[13px] text-bvc-ink"
    >
      <span className="flex justify-between gap-[10px]">
        <span className="flex min-w-0 flex-col gap-[2px]">
          <span className="text-[15px] font-semibold">{student.fullName}</span>
          <span className="font-bvc-mono text-[12px] text-bvc-muted">
            {detail ? `${student.studentCode ?? "-"} · ${detail}` : (student.studentCode ?? "-")}
          </span>
        </span>
        <StatusLabel
          label={STUDENT_STATUS_LABELS[student.status]}
          tone={STATUS_TONES[student.status]}
          className="text-[12px]"
        />
      </span>
      <span className="text-[12.5px] text-bvc-muted">{formatStudentSummary(student)}</span>
    </Link>
  );
}
