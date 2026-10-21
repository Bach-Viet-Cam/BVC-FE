import { useState } from "react";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { type Control, type FieldErrors, type UseFormRegister, useFieldArray, useWatch } from "react-hook-form";
import { ActionButton } from "@/features/classes/components/ActionButton";
import { ExercisePickerDialog } from "@/features/classes/components/ExercisePickerDialog";
import { INPUT_CLASSES } from "@/features/classes/components/FormField";
import {
  ROADMAP_CONTENT_MAX,
  ROADMAP_TITLE_MAX,
  type RoadmapFormValues,
} from "@/features/classes/utils/validateRoadmap";
import { cn } from "@/shared/utils/cn";

interface RoadmapWeekEditorProps {
  weekIndex: number;
  instrumentId: string;
  control: Control<RoadmapFormValues>;
  register: UseFormRegister<RoadmapFormValues>;
  errors: FieldErrors<RoadmapFormValues>;
}

const ICON_BUTTON_CLASSES =
  "flex size-[44px] shrink-0 cursor-pointer items-center justify-center rounded-[12px] border border-bvc-border-strong bg-white text-bvc-ink disabled:cursor-not-allowed disabled:opacity-40";

export function RoadmapWeekEditor({ weekIndex, instrumentId, control, register, errors }: RoadmapWeekEditorProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const { fields, append, move, remove } = useFieldArray({
    control,
    name: `weeks.${weekIndex}.exercises`,
    keyName: "fieldKey",
  });
  const weekNumber = useWatch({ control, name: `weeks.${weekIndex}.weekNumber` });
  const title = useWatch({ control, name: `weeks.${weekIndex}.title` }) ?? "";
  const content = useWatch({ control, name: `weeks.${weekIndex}.content` }) ?? "";
  const weekErrors = errors.weeks?.[weekIndex];
  const exercisesError = weekErrors?.exercises?.message ?? weekErrors?.exercises?.root?.message;
  const headingId = `roadmap-week-${weekIndex}-heading`;
  const titleId = `roadmap-week-${weekIndex}-title`;
  const contentId = `roadmap-week-${weekIndex}-content`;

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-[12px] rounded-[18px] border border-bvc-border p-[16px]"
    >
      <h3 id={headingId} className="m-0 text-[15px] font-extrabold tracking-[-0.01em]">
        Tuần {weekNumber}
      </h3>
      <div className="flex flex-col gap-[6px]">
        <div className="flex justify-between">
          <label htmlFor={titleId} className="text-[13.5px] font-semibold">
            Tiêu đề
          </label>
          <span id={`${titleId}-count`} className="font-bvc-mono text-[12px] text-bvc-muted">
            {title.length} / {ROADMAP_TITLE_MAX}
          </span>
        </div>
        <input
          id={titleId}
          {...register(`weeks.${weekIndex}.title`)}
          aria-describedby={`${titleId}-count`}
          aria-invalid={Boolean(weekErrors?.title)}
          className={INPUT_CLASSES}
        />
        {weekErrors?.title && (
          <span role="alert" className="text-[12px] text-bvc-error">
            {weekErrors.title.message}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-[6px]">
        <div className="flex justify-between">
          <label htmlFor={contentId} className="text-[13.5px] font-semibold">
            Nội dung học tập
          </label>
          <span id={`${contentId}-count`} className="font-bvc-mono text-[12px] text-bvc-muted">
            {content.length} / {ROADMAP_CONTENT_MAX}
          </span>
        </div>
        <textarea
          id={contentId}
          aria-describedby={`${contentId}-count`}
          rows={4}
          {...register(`weeks.${weekIndex}.content`)}
          aria-invalid={Boolean(weekErrors?.content)}
          className={cn(INPUT_CLASSES, "h-auto resize-y py-[11px] leading-[1.5]")}
        />
        {weekErrors?.content && (
          <span role="alert" className="text-[12px] text-bvc-error">
            {weekErrors.content.message}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-[8px]">
        <span className="text-[13.5px] font-semibold">Bài luyện ngón</span>
        {fields.length === 0 && <span className="text-[12.5px] text-bvc-muted">Chưa có bài luyện ngón.</span>}
        {fields.map((field, index) => (
          <div key={field.fieldKey} className="flex items-center gap-[8px] border-t border-bvc-border pt-[8px]">
            <span className="font-bvc-mono w-[22px] text-[12px] text-bvc-muted">{index + 1}.</span>
            <span className="flex min-w-0 grow flex-col">
              <span data-testid="roadmap-exercise-title" className="text-[14px] font-semibold">
                {field.title}
              </span>
              {!field.isAvailable && <span className="text-[12px] text-bvc-accent-text">Không còn khả dụng</span>}
            </span>
            <button
              type="button"
              aria-label={`Đưa ${field.title} lên`}
              disabled={index === 0}
              onClick={() => move(index, index - 1)}
              className={ICON_BUTTON_CLASSES}
            >
              <ArrowUp size={16} strokeWidth={1.8} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={`Đưa ${field.title} xuống`}
              disabled={index === fields.length - 1}
              onClick={() => move(index, index + 1)}
              className={ICON_BUTTON_CLASSES}
            >
              <ArrowDown size={16} strokeWidth={1.8} aria-hidden="true" />
            </button>
            <ActionButton aria-label={`Xóa ${field.title}`} onClick={() => remove(index)}>
              Xóa
            </ActionButton>
          </div>
        ))}
        {exercisesError && (
          <span role="alert" className="text-[12px] text-bvc-error">
            {exercisesError}
          </span>
        )}
        <div>
          <ActionButton onClick={() => setIsPickerOpen(true)}>
            <Plus size={16} strokeWidth={2} aria-hidden="true" /> Thêm bài luyện ngón
          </ActionButton>
        </div>
      </div>
      <ExercisePickerDialog
        isOpen={isPickerOpen}
        instrumentId={instrumentId}
        excludedPieceIds={fields.map((field) => field.pieceId)}
        onAdd={(exercises) =>
          append(exercises.map((exercise) => ({ pieceId: exercise.id, title: exercise.title, isAvailable: true })))
        }
        onClose={() => setIsPickerOpen(false)}
      />
    </section>
  );
}
