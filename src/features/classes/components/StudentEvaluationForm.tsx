import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { INPUT_CLASSES } from "@/shared/components/bvc/fieldStyles";
import { type ApiFieldError } from "@/features/classes/types/classTypes";
import { applyFieldErrors } from "@/features/classes/utils/mapApiErrors";
import { formatVietnamDateTime } from "@/features/classes/utils/teacherAssignmentFormat";
import type { StudentEvaluation } from "@/features/practice/types/studentStatsTypes";
import { cn } from "@/shared/utils/cn";

const EVALUATION_MAX = 2000;
export const EVALUATION_LOCKED_MESSAGE = "Không thể đánh giá vì lớp đã kết thúc hoặc sinh viên không còn trong lớp.";

const evaluationSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Đánh giá không được để trống.")
    .max(EVALUATION_MAX, `Đánh giá không được vượt quá ${EVALUATION_MAX} ký tự.`),
});
type EvaluationValues = z.infer<typeof evaluationSchema>;

interface StudentEvaluationFormProps {
  evaluation: StudentEvaluation | null;
  canEvaluate: boolean;
  onSave: (content: string) => Promise<ApiFieldError[] | null>;
}

// Đánh giá chung của giảng viên về sinh viên trong lớp (một bản, sửa là ghi đè)
export function StudentEvaluationForm({ evaluation, canEvaluate, onSave }: StudentEvaluationFormProps) {
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EvaluationValues>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: { content: evaluation?.content ?? "" },
  });
  const content = useWatch({ control, name: "content" }) ?? "";

  const submit = handleSubmit(async (values) => {
    const fieldErrors = await onSave(values.content.trim());
    if (fieldErrors) applyFieldErrors<EvaluationValues>(fieldErrors, ["content"], setError);
  });

  return (
    <section className="flex flex-col gap-3 rounded-bvc-xl border border-bvc-border bg-white p-4 md:p-5.5">
      <form onSubmit={submit} noValidate className="flex flex-col gap-[6px]">
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor="student-evaluation" className="text-sm font-semibold text-bvc-ink">
            Đánh giá chung
          </label>
          <span className="font-bvc-mono text-[12px] text-bvc-muted">
            {content.length} / {EVALUATION_MAX}
          </span>
        </div>
        <textarea
          id="student-evaluation"
          rows={5}
          readOnly={!canEvaluate}
          placeholder={canEvaluate ? "Nhận xét chung về quá trình học của sinh viên trong lớp" : undefined}
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
            {evaluation
              ? `Sửa lần cuối: ${evaluation.lecturerName}, ${formatVietnamDateTime(evaluation.updatedAt)}`
              : "Chưa có đánh giá"}
          </span>
          {canEvaluate && (
            <ActionButton type="submit" variant="primary" disabled={isSubmitting} className="px-3 text-[13px]">
              {evaluation ? "Cập nhật đánh giá" : "Lưu đánh giá"}
            </ActionButton>
          )}
        </div>
        {!canEvaluate && <span className="text-[12px] text-bvc-muted">{EVALUATION_LOCKED_MESSAGE}</span>}
      </form>
    </section>
  );
}
