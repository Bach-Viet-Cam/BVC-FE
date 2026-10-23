import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActionButton } from "@/features/classes/components/ActionButton";
import { FooterActions } from "@/features/classes/components/FooterActions";
import { FormField, INPUT_CLASSES } from "@/features/classes/components/FormField";
import { useClassSheetMusic } from "@/features/classes/hooks/useClassSheetMusic";
import { type ApiFieldError } from "@/features/classes/types/classTypes";
import { type AssignmentContentPayload, type AssignmentSheetMusic } from "@/features/classes/types/teacherAssignmentTypes";
import { ASSIGNMENT_KIND_LABELS, sheetMusicLabel } from "@/features/classes/utils/teacherAssignmentFormat";
import { applyFieldErrors } from "@/features/classes/utils/mapApiErrors";
import {
  ASSIGNMENT_DESCRIPTION_MAX,
  ASSIGNMENT_TITLE_MAX,
  assignmentFormSchema,
  type AssignmentFormValues,
  toAssignmentContent,
} from "@/features/classes/utils/validateAssignment";
import { cn } from "@/shared/utils/cn";

const FORM_FIELDS = ["classId", "title", "kind", "description", "sheetMusicId", "requiredBpm"] as const;

interface AssignmentFormProps {
  mode: "create" | "edit";
  initialValues: AssignmentFormValues;
  classes: Array<{ id: string; name: string }>;
  // Edit mode: the stored sheet music, shown even if it has since been hidden from the library.
  currentSheetMusic?: AssignmentSheetMusic | null;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (
    payload: AssignmentContentPayload & { classId: string },
    publish: boolean
  ) => Promise<ApiFieldError[] | null>;
}

export function AssignmentForm({
  mode,
  initialValues,
  classes,
  currentSheetMusic = null,
  isSaving,
  onCancel,
  onSubmit,
}: AssignmentFormProps) {
  const isEdit = mode === "edit";
  const {
    control,
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<AssignmentFormValues>({ resolver: zodResolver(assignmentFormSchema), defaultValues: initialValues });
  const classId = useWatch({ control, name: "classId" });
  const sheetMusicId = useWatch({ control, name: "sheetMusicId" });
  const title = useWatch({ control, name: "title" }) ?? "";
  const description = useWatch({ control, name: "description" }) ?? "";
  const { sheets } = useClassSheetMusic(classId);
  const selectedSheet = sheets.find((sheet) => sheet.id === sheetMusicId);
  const isCurrentSheetMissing = Boolean(currentSheetMusic && !sheets.some((sheet) => sheet.id === currentSheetMusic.id));
  const sheetMusicField = register("sheetMusicId");
  const className = classes.find((item) => item.id === classId)?.name ?? "";

  const submitWith = (publish: boolean) =>
    handleSubmit(async (values) => {
      const fieldErrors = await onSubmit({ classId: values.classId, ...toAssignmentContent(values) }, publish);
      if (fieldErrors) applyFieldErrors<AssignmentFormValues>(fieldErrors, FORM_FIELDS, setError);
    });

  return (
    <form onSubmit={submitWith(!isEdit)} noValidate className="flex grow flex-col">
      <div className="flex grow flex-col gap-[16px] px-[18px] pb-[18px] pt-[6px] lg:m-[22px_32px] lg:max-w-[720px] lg:grow-0 lg:rounded-[20px] lg:border lg:border-bvc-border lg:p-[20px]">
        <FormField id="assignment-class" label="Lớp" isRequired error={errors.classId?.message}>
          {isEdit ? (
            <input id="assignment-class" value={className} readOnly className={INPUT_CLASSES} />
          ) : (
            <select
              id="assignment-class"
              // A sheet music belongs to one instrument: changing class clears it.
              {...register("classId", { onChange: () => setValue("sheetMusicId", "") })}
              aria-invalid={Boolean(errors.classId)}
              className={INPUT_CLASSES}
            >
              <option value="">Chọn lớp</option>
              {classes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          )}
        </FormField>
        <FormField
          id="assignment-title"
          label="Tiêu đề"
          isRequired
          hint={`${title.length} / ${ASSIGNMENT_TITLE_MAX}`}
          error={errors.title?.message}
        >
          <input
            id="assignment-title"
            {...register("title")}
            aria-invalid={Boolean(errors.title)}
            className={INPUT_CLASSES}
          />
        </FormField>
        <FormField id="assignment-kind" label="Loại bài" isRequired error={errors.kind?.message}>
          <select
            id="assignment-kind"
            {...register("kind")}
            aria-invalid={Boolean(errors.kind)}
            className={INPUT_CLASSES}
          >
            <option value="">Chọn loại bài</option>
            {Object.entries(ASSIGNMENT_KIND_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField
          id="assignment-description"
          label="Mô tả"
          hint={`${description.length} / ${ASSIGNMENT_DESCRIPTION_MAX}`}
          error={errors.description?.message}
        >
          <textarea
            id="assignment-description"
            rows={4}
            {...register("description")}
            aria-invalid={Boolean(errors.description)}
            className={cn(INPUT_CLASSES, "h-auto resize-y py-[11px] leading-[1.5]")}
          />
        </FormField>
        <FormField id="assignment-sheet-music" label="Bài nhạc" error={errors.sheetMusicId?.message}>
          <select
            id="assignment-sheet-music"
            // Controlled: options arrive after mount, so an uncontrolled select would fall back to "Không chọn".
            {...sheetMusicField}
            value={sheetMusicId}
            aria-invalid={Boolean(errors.sheetMusicId)}
            className={INPUT_CLASSES}
          >
            <option value="">Không chọn</option>
            {isCurrentSheetMissing && currentSheetMusic && (
              <option value={currentSheetMusic.id}>
                {currentSheetMusic.isAvailable
                  ? sheetMusicLabel(currentSheetMusic)
                  : `${sheetMusicLabel(currentSheetMusic)} (Không còn khả dụng)`}
              </option>
            )}
            {sheets.map((sheet) => (
              <option key={sheet.id} value={sheet.id}>
                {sheetMusicLabel(sheet)}
              </option>
            ))}
          </select>
        </FormField>
        <FormField
          id="assignment-bpm"
          label="BPM yêu cầu"
          hint="Bỏ trống để dùng BPM mặc định của bài nhạc"
          error={errors.requiredBpm?.message}
        >
          <input
            id="assignment-bpm"
            inputMode="numeric"
            {...register("requiredBpm")}
            placeholder={selectedSheet?.defaultBpm ? `Mặc định: ${selectedSheet.defaultBpm}` : undefined}
            aria-invalid={Boolean(errors.requiredBpm)}
            className={cn(INPUT_CLASSES, "font-bvc-mono")}
          />
        </FormField>
      </div>
      <FooterActions>
        <ActionButton size="lg" onClick={onCancel} disabled={isSaving}>
          Hủy
        </ActionButton>
        {isEdit ? (
          <ActionButton size="lg" variant="primary" type="submit" disabled={isSaving}>
            {isSaving ? "Đang lưu…" : "Lưu"}
          </ActionButton>
        ) : (
          <>
            <ActionButton size="lg" onClick={submitWith(false)} disabled={isSaving}>
              Lưu nháp
            </ActionButton>
            <ActionButton size="lg" variant="primary" type="submit" disabled={isSaving}>
              Lưu & Giao Bài
            </ActionButton>
          </>
        )}
      </FooterActions>
    </form>
  );
}
