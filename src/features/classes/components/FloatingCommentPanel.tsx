import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronDown, ChevronUp, MessageSquareText } from "lucide-react";
import { COMMENT_LOCKED_MESSAGE } from "@/features/classes/components/SubmissionCard";
import { type ApiFieldError } from "@/features/classes/types/classTypes";
import { applyFieldErrors } from "@/features/classes/utils/mapApiErrors";
import { formatVietnamDateTime } from "@/features/classes/utils/teacherAssignmentFormat";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { INPUT_CLASSES } from "@/shared/components/bvc/fieldStyles";
import { cn } from "@/shared/utils/cn";

const COMMENT_MAX = 2000;
export const COMMENT_PANEL_STORAGE_KEY = "bvc.teacherCommentPanel.collapsed";

const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Nhận xét không được để trống.")
    .max(COMMENT_MAX, `Nhận xét không được vượt quá ${COMMENT_MAX} ký tự.`),
});
type CommentValues = z.infer<typeof commentSchema>;

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COMMENT_PANEL_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeCollapsed(collapsed: boolean) {
  try {
    localStorage.setItem(COMMENT_PANEL_STORAGE_KEY, collapsed ? "1" : "0");
  } catch {
    // Trình duyệt chặn lưu trữ: chỉ không nhớ được trạng thái thu nhỏ
  }
}

interface FloatingCommentPanelProps {
  submissionLabel: string;
  comment: { content: string; updatedAt: string } | null;
  canComment: boolean;
  onSave: (content: string) => Promise<ApiFieldError[] | null>;
}

// Khung nhận xét luôn nổi trên màn hình khi cuộn trang kết quả; thu nhỏ thành một thanh.
// Form luôn được giữ (chỉ ẩn) để chữ đang gõ không mất khi thu nhỏ hay sau khi lưu.
export function FloatingCommentPanel({ submissionLabel, comment, canComment, onSave }: FloatingCommentPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(readCollapsed);
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CommentValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: comment?.content ?? "" },
  });
  const content = useWatch({ control, name: "content" }) ?? "";

  const setCollapsed = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    writeCollapsed(collapsed);
  };

  const submit = handleSubmit(async (values) => {
    const fieldErrors = await onSave(values.content.trim());
    if (fieldErrors) applyFieldErrors<CommentValues>(fieldErrors, ["content"], setError);
  });

  return (
    <aside
      aria-label="Nhận xét bài nộp"
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-bvc-border bg-white shadow-[0_-8px_24px_rgba(18,63,51,0.10)]",
        "md:inset-x-auto md:right-8 md:bottom-6 md:w-[380px] md:rounded-bvc-xl md:border md:shadow-[0_12px_32px_rgba(18,63,51,0.16)]"
      )}
    >
      {isCollapsed ? (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          aria-label={`Mở nhận xét (${comment ? "đã gửi" : "chưa gửi"})`}
          className="flex min-h-12 w-full cursor-pointer items-center gap-2 px-4 text-left text-[13.5px] font-semibold text-bvc-ink"
        >
          <MessageSquareText className="size-4 text-bvc-accent" aria-hidden />
          <span className="flex-1">Nhận xét</span>
          <span className="text-[12px] font-medium text-bvc-muted">{comment ? "Đã gửi" : "Chưa gửi"}</span>
          <ChevronUp className="size-4 text-bvc-muted" aria-hidden />
        </button>
      ) : (
        <div className="flex items-center gap-2 px-4 pt-3">
          <MessageSquareText className="size-4 text-bvc-accent" aria-hidden />
          <span className="flex-1 truncate text-[13.5px] font-semibold text-bvc-ink">Nhận xét · {submissionLabel}</span>
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label="Thu nhỏ nhận xét"
            title="Thu nhỏ nhận xét"
            className="flex size-9 cursor-pointer items-center justify-center rounded-full text-bvc-muted hover:bg-bvc-surface"
          >
            <ChevronDown className="size-4" />
          </button>
        </div>
      )}

      <form
        onSubmit={submit}
        noValidate
        hidden={isCollapsed}
        className="flex max-h-[60dvh] flex-col gap-[6px] overflow-y-auto px-4 pt-2 pb-4"
      >
        <div className="flex justify-between">
          <label htmlFor="floating-comment" className="text-[12.5px] font-medium text-bvc-muted">
            Nhận xét
          </label>
          <span className="font-bvc-mono text-[12px] text-bvc-muted">
            {content.length} / {COMMENT_MAX}
          </span>
        </div>
        <textarea
          id="floating-comment"
          rows={5}
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
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <span className="text-[12px] text-bvc-muted">
            {comment ? `Đã gửi ${formatVietnamDateTime(comment.updatedAt)}` : "Chưa có nhận xét"}
          </span>
          {canComment && (
            <ActionButton type="submit" variant="primary" disabled={isSubmitting} className="px-3 text-[13px]">
              {comment ? "Cập nhật nhận xét" : "Gửi nhận xét"}
            </ActionButton>
          )}
        </div>
        {!canComment && <span className="text-[12px] text-bvc-muted">{COMMENT_LOCKED_MESSAGE}</span>}
      </form>
    </aside>
  );
}
