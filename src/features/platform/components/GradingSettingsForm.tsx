import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActionButton } from "@/features/classes/components/ActionButton";
import { FormField, INPUT_CLASSES } from "@/features/classes/components/FormField";
import { type ApiFieldError } from "@/features/classes/types/classTypes";
import { applyFieldErrors } from "@/features/classes/utils/mapApiErrors";
import { type GradingSettings, type GradingSettingsPayload } from "@/features/platform/types/settingsTypes";
import {
  describeGradingBands,
  gradingSettingsSchema,
  type GradingSettingsFormValues,
} from "@/features/platform/utils/validateGradingSettings";
import { cn } from "@/shared/utils/cn";

interface GradingSettingsFormProps {
  settings: GradingSettings;
  isSaving: boolean;
  onSubmit: (payload: GradingSettingsPayload) => Promise<ApiFieldError[] | null>;
}

export function GradingSettingsForm({ settings, isSaving, onSubmit }: GradingSettingsFormProps) {
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<GradingSettingsFormValues>({
    resolver: zodResolver(gradingSettingsSchema),
    defaultValues: { minAccuracy: String(settings.minAccuracy), atRiskMargin: String(settings.atRiskMargin) },
  });
  const minAccuracy = useWatch({ control, name: "minAccuracy" }) ?? "";
  const atRiskMargin = useWatch({ control, name: "atRiskMargin" }) ?? "";
  const bands = describeGradingBands(minAccuracy, atRiskMargin);

  const submit = handleSubmit(async (values) => {
    const fieldErrors = await onSubmit({
      minAccuracy: Number(values.minAccuracy),
      atRiskMargin: Number(values.atRiskMargin),
    });
    if (fieldErrors)
      applyFieldErrors<GradingSettingsFormValues>(fieldErrors, ["minAccuracy", "atRiskMargin"], setError);
  });

  return (
    <form
      onSubmit={submit}
      noValidate
      className="flex max-w-[560px] flex-col gap-[16px] rounded-[18px] border border-bvc-border p-[16px]"
    >
      <h2 className="m-0 text-[15px] font-extrabold tracking-[-0.01em]">Ngưỡng tiến độ</h2>
      <div className="grid grid-cols-2 gap-[12px]">
        <FormField id="grading-min" label="Độ chính xác tối thiểu (%)" isRequired error={errors.minAccuracy?.message}>
          <input
            id="grading-min"
            inputMode="numeric"
            {...register("minAccuracy")}
            aria-invalid={Boolean(errors.minAccuracy)}
            className={cn(INPUT_CLASSES, "font-bvc-mono")}
          />
        </FormField>
        <FormField id="grading-margin" label="Biên có nguy cơ (%)" isRequired error={errors.atRiskMargin?.message}>
          <input
            id="grading-margin"
            inputMode="numeric"
            {...register("atRiskMargin")}
            aria-invalid={Boolean(errors.atRiskMargin)}
            className={cn(INPUT_CLASSES, "font-bvc-mono")}
          />
        </FormField>
      </div>
      {bands && (
        <p className="m-0 rounded-[14px] bg-bvc-soft px-[14px] py-[12px] text-[13px] text-bvc-muted">{bands}</p>
      )}
      <p className="m-0 text-[12.5px] text-bvc-muted">
        Áp dụng cho mọi bài tập: "Đạt" khi có bài nộp đạt độ chính xác tối thiểu; trạng thái tiến độ dùng cả hai giá
        trị.
      </p>
      <div>
        <ActionButton type="submit" variant="primary" size="lg" className="max-w-[180px]" disabled={isSaving}>
          {isSaving ? "Đang lưu…" : "Lưu"}
        </ActionButton>
      </div>
    </form>
  );
}
