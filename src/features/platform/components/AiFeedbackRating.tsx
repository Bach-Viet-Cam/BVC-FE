import { useId, useState } from "react";
import { Check, MessageSquareText, Star } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { aiRatingApi, type AiRatingState } from "@/features/platform/api/aiRatingApi";
import { aiRatingSchema, type AiRatingFormValues } from "@/features/platform/utils/validateAiRating";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { INPUT_CLASSES } from "@/shared/components/bvc/fieldStyles";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { cn } from "@/shared/utils/cn";
import {
  Dialog,
  DialogTrigger,
  DialogPopup,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/shared/components/ui/dialog";

interface StarsProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  disabled: boolean;
}

function Stars({ label, value, onChange, disabled }: StarsProps) {
  const name = useId();
  const [preview, setPreview] = useState(0);
  const visibleValue = preview || value;
  return (
    <fieldset disabled={disabled} className="min-w-0">
      <legend className="text-sm font-medium text-bvc-ink">{label}</legend>
      <div className="mt-2 flex flex-wrap items-center gap-2" onMouseLeave={() => setPreview(0)}>
        <div className="flex rounded-bvc-sm bg-bvc-soft sm:bg-white/80">
          {[1, 2, 3, 4, 5].map((star) => (
            <label
              key={star}
              onMouseEnter={() => !disabled && setPreview(star)}
              className={cn(
                "relative flex size-11 items-center justify-center rounded-lg focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-bvc-ink",
                disabled ? "cursor-wait" : "cursor-pointer"
              )}
            >
              <input
                type="radio"
                name={name}
                value={star}
                checked={value === star}
                onChange={() => onChange(star)}
                aria-label={`${star} sao`}
                className="peer sr-only"
              />
              <Star
                size={27}
                strokeWidth={1.6}
                aria-hidden
                className={cn(
                  "transition-[color,fill,transform] duration-200 ease-out motion-reduce:transition-none",
                  star <= visibleValue ? "fill-bvc-gold text-bvc-accent-text" : "fill-transparent text-bvc-muted",
                  preview === star && "motion-safe:-translate-y-0.5 motion-safe:scale-110"
                )}
              />
            </label>
          ))}
        </div>
        <span className="ml-1 min-w-7 text-xs tabular-nums text-bvc-muted" aria-live="polite">
          {value ? `${value}/5` : ""}
        </span>
      </div>
    </fieldset>
  );
}

interface RatingFormProps {
  submissionId: string;
  state: AiRatingState;
  onSaved: (state: AiRatingState) => void;
  onSavingChange?: (saving: boolean) => void;
}

function RatingForm({ submissionId, state, onSaved, onSavingChange }: RatingFormProps) {
  const { control, register, setValue, handleSubmit, reset, formState } = useForm<AiRatingFormValues>({
    resolver: zodResolver(aiRatingSchema),
    defaultValues: {
      accuracyStars: state.rating?.accuracyStars ?? 0,
      satisfactionStars: state.rating?.satisfactionStars ?? 0,
      comment: state.rating?.comment ?? "",
    },
  });
  const [accuracy, satisfaction, comment] = useWatch({
    control,
    name: ["accuracyStars", "satisfactionStars", "comment"],
  });
  const [error, setError] = useState<string | null>(null);
  const commentId = useId();
  const pending = formState.isSubmitting;
  const saved = Boolean(state.rating) && !formState.isDirty;

  const submit = handleSubmit(async (values) => {
    if (pending || !state.feedbackKey) return;
    setError(null);
    onSavingChange?.(true);
    try {
      const result = await aiRatingApi.save(submissionId, {
        feedbackKey: state.feedbackKey,
        accuracyStars: values.accuracyStars,
        satisfactionStars: values.satisfactionStars,
        ...(state.canComment ? { comment: values.comment.trim() || null } : {}),
      });
      reset(values);
      onSaved(result);
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      onSavingChange?.(false);
    }
  });

  return (
    <form className="flex min-w-0 flex-col gap-5" onSubmit={submit}>
      <div className="grid min-w-0 gap-5 @min-[580px]/rating:grid-cols-2">
        <Stars
          label="Độ chính xác của AI"
          value={accuracy}
          onChange={(value) => setValue("accuracyStars", value, { shouldDirty: true })}
          disabled={pending}
        />
        <Stars
          label="Mức độ hài lòng"
          value={satisfaction}
          onChange={(value) => setValue("satisfactionStars", value, { shouldDirty: true })}
          disabled={pending}
        />
      </div>
      {state.canComment && (
        <div className="flex flex-col gap-2">
          <label htmlFor={commentId} className="text-sm font-medium">
            Nhận xét về độ chính xác của AI
          </label>
          <div className="relative">
            <textarea
              {...register("comment")}
              id={commentId}
              rows={3}
              maxLength={2000}
              disabled={pending}
              className={cn(INPUT_CLASSES, "h-auto resize-y bg-white py-3 pb-7 text-sm")}
            />
            <span className="pointer-events-none absolute right-4 bottom-3 text-xs tabular-nums text-bvc-muted">
              {comment.length}/2000
            </span>
          </div>
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-bvc-accent-text">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-bvc-border pt-4">
        <span role="status" className="inline-flex items-center gap-2 text-sm text-bvc-accent">
          {saved && (
            <>
              <Check size={17} aria-hidden />
              Đã lưu đánh giá
            </>
          )}
        </span>
        <ActionButton
          type="submit"
          isLoading={pending}
          disabled={!accuracy || !satisfaction || saved}
          className="min-h-11 text-sm"
        >
          {state.rating ? "Cập nhật đánh giá" : "Gửi đánh giá"}
        </ActionButton>
      </div>
    </form>
  );
}

interface AiFeedbackRatingProps {
  submissionId: string;
  showFeedback?: boolean;
  expectedFeedback?: string;
  onReloadFeedback?: () => void;
  presentation?: "inline" | "dialog";
}

export function AiFeedbackRating({
  submissionId,
  showFeedback = false,
  expectedFeedback,
  onReloadFeedback,
  presentation = "inline",
}: AiFeedbackRatingProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const state = useAsyncData(() => aiRatingApi.get(submissionId), `ai-rating:${submissionId}`);
  if (state.isLoading) return null;
  if (state.error)
    return (
      <div role="alert" className="flex flex-wrap items-center gap-3 py-4 text-sm text-bvc-muted">
        <span>Không tải được đánh giá AI.</span>
        <ActionButton variant="secondary" onClick={state.reload}>
          Thử lại
        </ActionButton>
      </div>
    );
  if (!state.data?.feedback || !state.data.feedbackKey) return null;
  if (expectedFeedback !== undefined && expectedFeedback.trim() !== state.data.feedback)
    return (
      <div
        role="alert"
        className="flex flex-wrap items-center gap-3 border-t border-bvc-border py-4 text-sm text-bvc-muted"
      >
        <span>Phản hồi AI đã được cập nhật.</span>
        <ActionButton
          variant="secondary"
          onClick={() => {
            state.reload();
            onReloadFeedback?.();
          }}
        >
          Tải lại kết quả
        </ActionButton>
      </div>
    );
  if (presentation === "dialog")
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Dialog
          open={open}
          onOpenChange={(nextOpen) => {
            if (!saving) setOpen(nextOpen);
          }}
        >
          <DialogTrigger render={<ActionButton variant="secondary" />}>
            <Star size={17} aria-hidden />
            {state.data.rating ? "Sửa đánh giá" : "Đánh giá phản hồi AI"}
          </DialogTrigger>
          <DialogPopup className="@container/rating w-[calc(100%-32px)] max-w-[640px] gap-5 rounded-bvc-xl border-bvc-border bg-white p-5 text-bvc-ink sm:p-7 motion-reduce:transition-none">
            <div className="pr-10">
              <DialogTitle className="font-semibold text-bvc-ink">Đánh giá phản hồi AI</DialogTitle>
              <DialogDescription className="mt-3 max-h-32 overflow-y-auto whitespace-pre-wrap break-words text-sm leading-6 text-bvc-muted">
                {state.data.feedback}
              </DialogDescription>
            </div>
            <DialogClose disabled={saving} className="flex size-11 items-center justify-center disabled:opacity-40" />
            {open && (
              <RatingForm
                submissionId={submissionId}
                state={state.data}
                onSavingChange={setSaving}
                onSaved={(result) => {
                  state.mutate(() => result);
                  setOpen(false);
                }}
              />
            )}
          </DialogPopup>
        </Dialog>
        {state.data.rating && (
          <span role="status" className="inline-flex items-center gap-2 text-sm text-bvc-accent">
            <Check size={17} aria-hidden />
            Đã lưu đánh giá
          </span>
        )}
      </div>
    );
  return (
    <section aria-label="Đánh giá phản hồi AI" className="flex min-w-0 flex-col gap-5 border-t border-bvc-border pt-5">
      {showFeedback && (
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold text-bvc-ink">
            <MessageSquareText size={18} strokeWidth={1.7} aria-hidden />
            Phản hồi AI
          </h3>
          <p className="mt-3 max-w-prose whitespace-pre-wrap break-words text-sm leading-7 text-bvc-muted">
            {state.data.feedback}
          </p>
        </div>
      )}
      <div className="@container/rating min-w-0 sm:rounded-bvc-md sm:bg-bvc-soft sm:p-5">
        <h3 className="mb-5 text-base font-semibold text-bvc-ink">Đánh giá phản hồi AI</h3>
        <RatingForm
          key={state.data.feedbackKey}
          submissionId={submissionId}
          state={state.data}
          onSaved={(result) => state.mutate(() => result)}
        />
      </div>
    </section>
  );
}
