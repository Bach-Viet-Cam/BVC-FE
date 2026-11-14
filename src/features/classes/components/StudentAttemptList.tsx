import { ChevronRight, MessageSquareText } from "lucide-react";
import { StatusLabel } from "@/features/classes/components/StatusLabel";
import type { SubmissionStatus } from "@/features/classes/types/teacherAssignmentTypes";
import { buildAttemptRows } from "@/features/classes/utils/studentStatsFormat";
import {
  SUBMISSION_STATUS_LABELS,
  formatPercent,
  formatVietnamDateTime,
} from "@/features/classes/utils/teacherAssignmentFormat";
import type { StudentStatsAssignment } from "@/features/practice/types/studentStatsTypes";

const STATUS_TONES: Record<SubmissionStatus, "ok" | "warn" | "muted"> = {
  COMPLETED: "ok",
  PROCESSING: "muted",
  REJECTED: "warn",
  FAILED: "warn",
};

interface StudentAttemptListProps {
  assignments: StudentStatsAssignment[];
  selectedAssignmentId: string | null;
  onOpen: (submissionId: string) => void;
}

// Lịch sử nộp bài (mới nhất trước); mỗi dòng mở trang kết quả của lần nộp đó
export function StudentAttemptList({ assignments, selectedAssignmentId, onOpen }: StudentAttemptListProps) {
  const rows = buildAttemptRows(assignments, selectedAssignmentId);

  return (
    <section className="flex flex-col gap-3 rounded-bvc-xl border border-bvc-border bg-white p-4 md:p-5.5">
      <h2 className="text-sm font-semibold text-bvc-ink">Lịch sử nộp bài</h2>
      {rows.length === 0 ? (
        <p className="text-[13px] text-bvc-muted">Sinh viên chưa có bài nộp nào.</p>
      ) : (
        <ul aria-label="Lịch sử nộp bài" className="-mx-2 flex flex-col">
          {rows.map((row) => (
            <li key={row.submissionId}>
              <button
                type="button"
                onClick={() => onOpen(row.submissionId)}
                className="flex w-full cursor-pointer items-center gap-3 rounded-[12px] px-2 py-[10px] text-left hover:bg-bvc-soft"
              >
                <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                  <span className="truncate text-[13.5px] font-medium text-bvc-ink">
                    {row.assignmentTitle} · Lần {row.attemptNo}
                  </span>
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-bvc-muted">
                    <span>{formatVietnamDateTime(row.submittedAt)}</span>
                    <StatusLabel
                      label={SUBMISSION_STATUS_LABELS[row.status]}
                      tone={STATUS_TONES[row.status]}
                      className="text-[12px]"
                    />
                    {row.hasComment && (
                      <span className="flex items-center gap-1 text-bvc-accent">
                        <MessageSquareText className="size-3.5" aria-hidden />
                        Đã nhận xét
                      </span>
                    )}
                  </span>
                </span>
                <span className="font-bvc-mono text-[14px] font-semibold text-bvc-ink">
                  {row.accuracy === null ? "-" : formatPercent(row.accuracy)}
                </span>
                <ChevronRight className="size-4 shrink-0 text-bvc-faint" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
