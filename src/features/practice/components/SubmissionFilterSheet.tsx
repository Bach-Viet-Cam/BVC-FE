import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, X } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import {
  PracticeBottomSheet,
  PracticeSheetClose,
  PracticeSheetTitle,
} from "@/features/practice/components/PracticeBottomSheet";
import {
  ADVANCED_ACCURACY_PRESETS,
  ADVANCED_DATE_PRESETS,
  ADVANCED_KIND_OPTIONS,
  EMPTY_ADVANCED_FILTER,
} from "@/features/practice/constants/submissionHistoryMockData";
import type { SubmissionAdvancedFilter } from "@/features/practice/types/submissionHistoryTypes";
import { daysAgoIso, todayIso } from "@/features/practice/utils/submissionHistory";
import {
  submissionFilterSchema,
  type SubmissionFilterValues,
} from "@/features/practice/utils/validateSubmissionFilter";
import { DateInput } from "@/shared/components/ui/date-input";
import { cn } from "@/shared/utils/cn";

const FIELD_CLASS =
  "h-11 w-full min-w-0 rounded-[13px] border border-bvc-border-strong bg-white px-3 text-sm text-bvc-ink outline-none focus:border-bvc-ink";
const MONO_FIELD_CLASS = cn(FIELD_CLASS, "font-bvc-mono");

// Bật/tắt một lựa chọn trong nhóm chọn nhiều (loại bài)
function toggleValue<T extends string>(current: T[], value: T): T[] {
  return current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
}

interface SubmissionFilterSheetProps {
  open: boolean;
  advanced: SubmissionAdvancedFilter;
  onOpenChange: (open: boolean) => void;
  onApply: (advanced: SubmissionAdvancedFilter) => void;
}

interface PresetChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function PresetChip({ label, active, onClick }: PresetChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-9 cursor-pointer rounded-xl border px-3.5 text-[13.5px]",
        active
          ? "border-bvc-accent bg-bvc-accent-tint font-bold text-bvc-accent-text"
          : "border-bvc-border-strong bg-white text-bvc-ink"
      )}
    >
      {label}
    </button>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-bvc-error">{message}</p>;
}

interface AdvancedFormProps {
  advanced: SubmissionAdvancedFilter;
  onApply: (advanced: SubmissionAdvancedFilter) => void;
}

function AdvancedForm({ advanced, onApply }: AdvancedFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<SubmissionFilterValues>({
    resolver: zodResolver(submissionFilterSchema),
    defaultValues: advanced,
  });
  // DateInput giữ chữ gõ riêng nên đổi key khi giá trị được đặt từ bên ngoài (mốc nhanh, đặt lại)
  const [dateNonce, setDateNonce] = useState(0);

  // useWatch thay vì watch() để React Compiler vẫn memo được component
  const values = useWatch({ control });

  function setDateRange(fromDate: string, toDate: string) {
    setValue("fromDate", fromDate, { shouldValidate: true });
    setValue("toDate", toDate, { shouldValidate: true });
    setDateNonce((value) => value + 1);
  }

  function setAccuracyRange(min: string, max: string) {
    setValue("minAccuracy", min, { shouldValidate: true });
    setValue("maxAccuracy", max, { shouldValidate: true });
  }

  function resetAll() {
    reset(EMPTY_ADVANCED_FILTER);
    setDateNonce((value) => value + 1);
  }

  return (
    <form onSubmit={handleSubmit(onApply)} className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-bvc-border py-2 pr-3 pl-5">
        <PracticeSheetTitle className="flex-1 font-bvc-display text-lg font-extrabold tracking-[-0.02em] text-bvc-ink">
          Lọc nâng cao
        </PracticeSheetTitle>
        <button
          type="button"
          onClick={resetAll}
          className="min-h-11 cursor-pointer px-3 text-sm font-bold text-bvc-ink"
        >
          Đặt lại
        </button>
        <PracticeSheetClose
          aria-label="Đóng"
          className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-bvc-md text-bvc-ink"
        >
          <X className="size-[18px]" strokeWidth={1.9} />
        </PracticeSheetClose>
      </div>

      <div className="flex flex-col gap-5 overflow-y-auto px-5 pt-4 pb-1.5">
        <section className="flex flex-col gap-2">
          <label htmlFor="submission-filter-title" className="text-[13px] font-bold text-bvc-muted">
            Tên bài
          </label>
          <div className="flex min-h-11 items-center gap-2 rounded-[13px] border border-bvc-border-strong bg-white px-3 focus-within:border-bvc-ink">
            <Search className="size-[17px] shrink-0 text-bvc-muted" strokeWidth={1.7} aria-hidden />
            <input
              id="submission-filter-title"
              type="text"
              placeholder="Nhập tên bài"
              className="min-w-0 flex-1 bg-transparent text-sm text-bvc-ink outline-none"
              {...register("title")}
            />
            {values.title && (
              <button
                type="button"
                aria-label="Xóa tên bài"
                onClick={() => setValue("title", "")}
                className="flex size-[22px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-bvc-surface text-bvc-muted"
              >
                <X className="size-3" strokeWidth={2.4} />
              </button>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <span className="text-[13px] font-bold text-bvc-muted">Ngày nộp</span>
          <div className="flex items-start gap-2.5">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="text-xs text-bvc-muted">Từ ngày</span>
              <DateInput
                key={`from-${dateNonce}`}
                label="Từ ngày"
                className={MONO_FIELD_CLASS}
                value={values.fromDate ?? ""}
                onChange={(value) => setValue("fromDate", value, { shouldValidate: true })}
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="text-xs text-bvc-muted">Đến ngày</span>
              <DateInput
                key={`to-${dateNonce}`}
                label="Đến ngày"
                className={MONO_FIELD_CLASS}
                value={values.toDate ?? ""}
                onChange={(value) => setValue("toDate", value, { shouldValidate: true })}
              />
            </div>
          </div>
          <FieldError message={errors.toDate?.message} />
          <div className="flex flex-wrap gap-[7px]">
            {ADVANCED_DATE_PRESETS.map((preset) => {
              const from = preset.days === null ? "" : daysAgoIso(preset.days);
              const to = preset.days === null ? "" : todayIso();
              return (
                <PresetChip
                  key={preset.label}
                  label={preset.label}
                  active={values.fromDate === from && values.toDate === to}
                  onClick={() => setDateRange(from, to)}
                />
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <span className="text-[13px] font-bold text-bvc-muted">Accuracy</span>
          <div className="flex items-start gap-2.5">
            <label className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="text-xs text-bvc-muted">Từ</span>
              <span className="relative">
                <input
                  inputMode="numeric"
                  maxLength={3}
                  aria-label="Accuracy từ"
                  className={cn(MONO_FIELD_CLASS, "pr-8")}
                  {...register("minAccuracy")}
                />
                <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[13px] text-bvc-muted">%</span>
              </span>
            </label>
            <label className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="text-xs text-bvc-muted">Đến</span>
              <span className="relative">
                <input
                  inputMode="numeric"
                  maxLength={3}
                  aria-label="Accuracy đến"
                  className={cn(MONO_FIELD_CLASS, "pr-8")}
                  {...register("maxAccuracy")}
                />
                <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[13px] text-bvc-muted">%</span>
              </span>
            </label>
          </div>
          <FieldError message={errors.minAccuracy?.message ?? errors.maxAccuracy?.message} />
          <div className="flex flex-wrap gap-[7px]">
            {ADVANCED_ACCURACY_PRESETS.map((preset) => (
              <PresetChip
                key={preset.label}
                label={preset.label}
                active={values.minAccuracy === preset.min && values.maxAccuracy === preset.max}
                onClick={() => setAccuracyRange(preset.min, preset.max)}
              />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <span className="text-[13px] font-bold text-bvc-muted">Loại bài</span>
          <div className="flex flex-wrap gap-[7px]">
            {ADVANCED_KIND_OPTIONS.map((option) => (
              <PresetChip
                key={option.value}
                label={option.label}
                active={(values.kinds ?? []).includes(option.value)}
                onClick={() => setValue("kinds", toggleValue(values.kinds ?? [], option.value), { shouldValidate: true })}
              />
            ))}
          </div>
        </section>

      </div>

      <div className="mt-3.5 shrink-0 border-t border-bvc-border-strong bg-white px-4 pt-3.5 pb-6">
        <button
          type="submit"
          className="flex min-h-12.5 w-full cursor-pointer items-center justify-center rounded-2xl bg-bvc-ink text-[15px] font-bold text-white"
        >
          Áp dụng
        </button>
      </div>
    </form>
  );
}

// Popup lọc nâng cao: tên bài, khoảng ngày nộp, khoảng accuracy. Chạy cùng bộ lọc nhanh.
export function SubmissionFilterSheet({ open, advanced, onOpenChange, onApply }: SubmissionFilterSheetProps) {
  return (
    <PracticeBottomSheet open={open} onOpenChange={onOpenChange} className="max-w-[428px]">
      <AdvancedForm advanced={advanced} onApply={onApply} />
    </PracticeBottomSheet>
  );
}
