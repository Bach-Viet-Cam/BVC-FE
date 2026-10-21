import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ActionButton } from "@/features/classes/components/ActionButton";
import { INPUT_CLASSES } from "@/features/classes/components/FormField";
import { StatusLabel } from "@/features/classes/components/StatusLabel";
import { type ApiFieldError } from "@/features/classes/types/classTypes";
import { type StudentSubmission, type SubmissionStatus } from "@/features/classes/types/teacherAssignmentTypes";
import {
  SUBMISSION_STATUS_LABELS,
  formatPercent,
  formatVietnamDateTime,
} from "@/features/classes/utils/teacherAssignmentFormat";
import { applyFieldErrors } from "@/features/classes/utils/mapApiErrors";
import { cn } from "@/shared/utils/cn";

const COMMENT_MAX = 2000;
export const COMMENT_LOCKED_MESSAGE = "Không thể nhận xét vì lớp đã kết thúc hoặc sinh viên không còn trong lớp.";

const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Nhận xét không được để trống.")
    .max(COMMENT_MAX, `Nhận xét không được vượt quá ${COMMENT_MAX} ký tự.`),
});
type CommentValues = z.infer<typeof commentSchema>;

interface SubmissionCardProps {
  submission: StudentSubmission;
  canComment: boolean;
  onSaveComment: (content: string) => Promise<ApiFieldError[] | null>;
}

const STATUS_TONES: Record<SubmissionStatus, "ok" | "warn" | "muted"> = {
  COMPLETED: "ok",
  PROCESSING: "muted",
  REJECTED: "warn",
  FAILED: "warn",
};

export function SubmissionCard({ submission, canComment, onSaveComment }: SubmissionCardProps) {
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CommentValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: submission.comment?.content ?? "" },
  });
  const content = useWatch({ control, name: "content" }) ?? "";
  const commentId = `comment-${submission.id}`;

  const submit = handleSubmit(async (values) => {
    const fieldErrors = await onSaveComment(values.content.trim());
    if (fieldErrors) applyFieldErrors<CommentValues>(fieldErrors, ["content"], setError);
  });

  return (
    <article className="flex flex-col gap-[10px] rounded-[18px] border border-bvc-border px-[14px] py-[13px]">
      <div className="flex justify-between gap-[10px]">
        <span className="text-[13.5px] font-bold">
          Lần nộp {submission.attemptNumber} · {formatVietnamDateTime(submission.submittedAt)} · phiên bản v
          {submission.version}
        </span>
        <StatusLabel
          label={SUBMISSION_STATUS_LABELS[submission.status]}
          tone={STATUS_TONES[submission.status]}
          className="text-[12px]"
        />
      </div>
      {(submission.accuracy !== null || submission.tempoDeviation !== null) && (
        <div className="flex flex-wrap gap-[12px] text-[12.5px] text-bvc-muted">
          {submission.accuracy !== null && <span>Độ chính xác {formatPercent(submission.accuracy)}</span>}
          {submission.tempoDeviation !== null && <span>Lệch tempo {formatPercent(submission.tempoDeviation)}</span>}
        </div>
      )}
      <audio controls preload="none" src={submission.audioUrl} className="w-full">
        Trình duyệt không phát được bản thu.
      </audio>
      <form onSubmit={submit} noValidate className="flex flex-col gap-[6px]">
        <div className="flex justify-between">
          <label htmlFor={commentId} className="text-[13.5px] font-semibold">
            Nhận xét
          </label>
          <span className="font-bvc-mono text-[12px] text-bvc-muted">
            {content.length} / {COMMENT_MAX}
          </span>
        </div>
        <textarea
          id={commentId}
          rows={3}
          readOnly={!canComment}
          {...register("content")}
          aria-invalid={Boolean(errors.content)}
          className={cn(INPUT_CLASSES, "h-auto resize-y py-[11px] leading-[1.5]")}
        />
        {errors.content && (
          <span role="alert" className="text-[12px] text-bvc-error">
            {errors.content.message}
          </span>
        )}
        {canComment ? (
          <div className="flex justify-end">
            <ActionButton type="submit" variant="primary" disabled={isSubmitting}>
              {submission.comment ? "Cập nhật nhận xét" : "Gửi nhận xét"}
            </ActionButton>
          </div>
        ) : (
          <span className="text-[12px] text-bvc-muted">{COMMENT_LOCKED_MESSAGE}</span>
        )}
      </form>
    </article>
  );
}
