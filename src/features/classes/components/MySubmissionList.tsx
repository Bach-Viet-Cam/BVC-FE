import { StatusLabel } from "@/features/classes/components/StatusLabel";
import { type MySubmission } from "@/features/classes/types/assignmentTypes";
import { type SubmissionStatus } from "@/features/classes/types/teacherAssignmentTypes";
import {
  SUBMISSION_STATUS_LABELS,
  formatPercent,
  formatVietnamDateTime,
} from "@/features/classes/utils/teacherAssignmentFormat";

interface MySubmissionListProps {
  submissions: MySubmission[];
}

const STATUS_TONES: Record<SubmissionStatus, "ok" | "warn" | "muted"> = {
  COMPLETED: "ok",
  PROCESSING: "muted",
  REJECTED: "warn",
  FAILED: "warn",
};

export function MySubmissionList({ submissions }: MySubmissionListProps) {
  return (
    <section className="rounded-2xl border border-bvc-border bg-white p-4 md:p-5 shadow-2xs">
      <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-bvc-muted">Bài nộp của bạn</h3>
      {submissions.length === 0 ? (
        <p className="mt-2 text-[13px] text-bvc-muted">Bạn chưa nộp bài này.</p>
      ) : (
        <ul className="mt-2 flex flex-col">
          {submissions.map((submission) => (
            <li key={submission.id} className="flex flex-col gap-2 border-b border-bvc-line py-2.5 last:border-0">
              <div className="flex items-center justify-between gap-3 text-[13px]">
                <span className="font-semibold text-bvc-ink">
                  Lượt {submission.attemptNumber} · {formatVietnamDateTime(submission.submittedAt, false)}
                </span>
                <span className="flex items-center gap-3">
                  {submission.accuracy !== null && (
                    <span className="font-bvc-mono text-[12.5px] font-bold text-bvc-ink">
                      {formatPercent(submission.accuracy)}
                    </span>
                  )}
                  <StatusLabel
                    label={SUBMISSION_STATUS_LABELS[submission.status]}
                    tone={STATUS_TONES[submission.status]}
                    className="text-[12px]"
                  />
                </span>
              </div>
              {submission.comment ? (
                <div className="rounded-lg border border-bvc-border bg-bvc-surface/60 px-3 py-2 text-[12.5px]">
                  <p className="text-[11.5px] font-bold text-bvc-muted">Nhận xét của giảng viên</p>
                  <p className="mt-1 whitespace-pre-line leading-relaxed text-bvc-ink">{submission.comment.content}</p>
                  <p className="mt-1 text-right text-[11px] text-bvc-faint">
                    Cập nhật {formatVietnamDateTime(submission.comment.updatedAt, false)}
                  </p>
                </div>
              ) : (
                <p className="text-[12px] text-bvc-faint">Chưa có nhận xét</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
