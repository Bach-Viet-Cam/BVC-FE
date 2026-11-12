import { type FieldErrors, type UseFormRegister } from "react-hook-form";
import { FormField } from "@/shared/components/bvc/FormField";
import { INPUT_CLASSES } from "@/shared/components/bvc/fieldStyles";
import { type AssignmentSheetMusic, type ClassSheetMusic } from "@/features/classes/types/teacherAssignmentTypes";
import { ASSIGNMENT_KIND_LABELS, sheetMusicLabel } from "@/features/classes/utils/teacherAssignmentFormat";
import {
  ASSIGNMENT_DESCRIPTION_MAX,
  ASSIGNMENT_TITLE_MAX,
  type AssignmentFormValues,
} from "@/features/classes/utils/validateAssignment";
import { cn } from "@/shared/utils/cn";

type ContentValues = Omit<AssignmentFormValues, "classId">;

interface AssignmentContentFieldsProps<V extends ContentValues> {
  register: UseFormRegister<V>;
  errors: FieldErrors<V>;
  title: string;
  description: string;
  sheetMusicId: string;
  sheets: ClassSheetMusic[];
  // Stored sheet music, shown even if it has since been hidden from the library.
  currentSheetMusic: AssignmentSheetMusic | null;
  idPrefix: string;
}

// The five content fields shared by the assignment form and the copy-edit dialog.
export function AssignmentContentFields<V extends ContentValues>({
  register: registerGeneric,
  errors: errorsGeneric,
  title,
  description,
  sheetMusicId,
  sheets,
  currentSheetMusic,
  idPrefix,
}: AssignmentContentFieldsProps<V>) {
  // Generic form values are opaque to TS; narrow to the known content fields.
  const register = registerGeneric as unknown as UseFormRegister<ContentValues>;
  const errors = errorsGeneric as unknown as FieldErrors<ContentValues>;
  const selectedSheet = sheets.find((sheet) => sheet.id === sheetMusicId);
  const isCurrentSheetMissing = Boolean(
    currentSheetMusic && !sheets.some((sheet) => sheet.id === currentSheetMusic.id)
  );

  return (
    <>
      <FormField
        htmlFor={`${idPrefix}-title`}
        label="Tiêu đề"
        required
        hint={`${title.length} / ${ASSIGNMENT_TITLE_MAX}`}
        error={errors.title?.message}
      >
        <input
          id={`${idPrefix}-title`}
          {...register("title")}
          aria-invalid={Boolean(errors.title)}
          className={INPUT_CLASSES}
        />
      </FormField>
      <FormField htmlFor={`${idPrefix}-kind`} label="Loại bài" required error={errors.kind?.message}>
        <select
          id={`${idPrefix}-kind`}
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
        htmlFor={`${idPrefix}-description`}
        label="Mô tả"
        hint={`${description.length} / ${ASSIGNMENT_DESCRIPTION_MAX}`}
        error={errors.description?.message}
      >
        <textarea
          id={`${idPrefix}-description`}
          rows={4}
          {...register("description")}
          aria-invalid={Boolean(errors.description)}
          className={cn(INPUT_CLASSES, "h-auto resize-y py-[11px] leading-[1.5]")}
        />
      </FormField>
      <FormField htmlFor={`${idPrefix}-sheet-music`} label="Bài nhạc" error={errors.sheetMusicId?.message}>
        <select
          id={`${idPrefix}-sheet-music`}
          // Controlled: options arrive after mount, so an uncontrolled select would fall back to "Không chọn".
          {...register("sheetMusicId")}
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
        htmlFor={`${idPrefix}-bpm`}
        label="BPM yêu cầu"
        hint="Bỏ trống để dùng BPM mặc định của bài nhạc"
        error={errors.requiredBpm?.message}
      >
        <input
          id={`${idPrefix}-bpm`}
          inputMode="numeric"
          {...register("requiredBpm")}
          placeholder={selectedSheet?.defaultBpm ? `Mặc định: ${selectedSheet.defaultBpm}` : undefined}
          aria-invalid={Boolean(errors.requiredBpm)}
          className={cn(INPUT_CLASSES, "font-bvc-mono")}
        />
      </FormField>
      <FormField
        htmlFor={`${idPrefix}-max-submissions`}
        label="Giới hạn lượt nộp"
        hint="Bỏ trống để không giới hạn"
        error={errors.maxSubmissions?.message}
      >
        <input
          id={`${idPrefix}-max-submissions`}
          inputMode="numeric"
          {...register("maxSubmissions")}
          placeholder="Không giới hạn"
          aria-invalid={Boolean(errors.maxSubmissions)}
          className={INPUT_CLASSES}
        />
      </FormField>
    </>
  );
}
