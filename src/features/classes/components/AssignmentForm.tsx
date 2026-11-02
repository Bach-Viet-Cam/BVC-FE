import { useImperativeHandle, type Ref } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { FormBody, FormFooter } from "@/shared/components/bvc/FormLayout";
import { FormField } from "@/shared/components/bvc/FormField";
import { INPUT_CLASSES } from "@/shared/components/bvc/fieldStyles";
import { useClassSheetMusic } from "@/features/classes/hooks/useClassSheetMusic";
import { type ApiFieldError } from "@/features/classes/types/classTypes";
import {
  type AssignmentContentPayload,
  type AssignmentSheetMusic,
} from "@/features/classes/types/teacherAssignmentTypes";
import { ASSIGNMENT_KIND_LABELS, sheetMusicLabel } from "@/features/classes/utils/teacherAssignmentFormat";
import { applyFieldErrors } from "@/features/classes/utils/mapApiErrors";
import {
  ASSIGNMENT_DESCRIPTION_MAX,
  ASSIGNMENT_TITLE_MAX,
  assignmentFormSchema,
  type AssignmentFormValues,
  toAssignmentContent,
} from "@/features/classes/utils/validateAssignment";
import { type DraftFormHandle } from "@/shared/hooks/useLeaveGuard";
import { useReportDirty } from "@/shared/hooks/useReportDirty";
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
  onDirtyChange?: (isDirty: boolean) => void;
  // Tạo mới: cho hộp hỏi lại khi thoát gọi "Lưu bản nháp"
  ref?: Ref<DraftFormHandle>;
}

export function AssignmentForm({
  mode,
  initialValues,
  classes,
  currentSheetMusic = null,
  isSaving,
  onCancel,
  onSubmit,
  onDirtyChange,
  ref,
}: AssignmentFormProps) {
  const isEdit = mode === "edit";
  const {
    control,
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isDirty },
  } = useForm<AssignmentFormValues>({ resolver: zodResolver(assignmentFormSchema), defaultValues: initialValues });
  const classId = useWatch({ control, name: "classId" });
  const sheetMusicId = useWatch({ control, name: "sheetMusicId" });
  const title = useWatch({ control, name: "title" }) ?? "";
  const description = useWatch({ control, name: "description" }) ?? "";
  const { sheets } = useClassSheetMusic(classId);
  const selectedSheet = sheets.find((sheet) => sheet.id === sheetMusicId);
  const isCurrentSheetMissing = Boolean(
    currentSheetMusic && !sheets.some((sheet) => sheet.id === currentSheetMusic.id)
  );
  const sheetMusicField = register("sheetMusicId");
  const className = classes.find((item) => item.id === classId)?.name ?? "";

  useReportDirty(isDirty, onDirtyChange);

  const save = async (values: AssignmentFormValues, publish: boolean) => {
    const fieldErrors = await onSubmit({ classId: values.classId, ...toAssignmentContent(values) }, publish);
    if (fieldErrors) applyFieldErrors<AssignmentFormValues>(fieldErrors, FORM_FIELDS, setError);
    return !fieldErrors;
  };

  const submitWith = (publish: boolean) =>
    handleSubmit(async (values) => {
      await save(values, publish);
    });

  useImperativeHandle(ref, () => ({
    saveDraft: () =>
      new Promise<boolean>((resolve) => {
        void handleSubmit(
          async (values) => resolve(await save(values, false)),
          () => resolve(false)
        )();
      }),
  }));

  return (
    <form onSubmit={submitWith(!isEdit)} noValidate className="flex grow flex-col">
      <FormBody>
        <FormField htmlFor="assignment-class" label="Lớp" required error={errors.classId?.message}>
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
          htmlFor="assignment-title"
          label="Tiêu đề"
          required
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
        <FormField htmlFor="assignment-kind" label="Loại bài" required error={errors.kind?.message}>
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
          htmlFor="assignment-description"
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
        <FormField htmlFor="assignment-sheet-music" label="Bài nhạc" error={errors.sheetMusicId?.message}>
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
          htmlFor="assignment-bpm"
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
      </FormBody>
      <FormFooter>
        <ActionButton variant="secondary" onClick={onCancel} disabled={isSaving}>
          Hủy
        </ActionButton>
        {isEdit ? (
          <ActionButton variant="primary" type="submit" disabled={isSaving}>
            {isSaving ? "Đang lưu…" : "Lưu"}
          </ActionButton>
        ) : (
          <>
            <ActionButton variant="secondary" onClick={submitWith(false)} disabled={isSaving}>
              Lưu nháp
            </ActionButton>
            <ActionButton variant="primary" type="submit" disabled={isSaving}>
              Lưu & Giao Bài
            </ActionButton>
          </>
        )}
      </FormFooter>
    </form>
  );
}
