import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActionButton } from "@/features/classes/components/ActionButton";
import { FooterActions } from "@/features/classes/components/FooterActions";
import { FormField, INPUT_CLASSES } from "@/features/classes/components/FormField";
import { useClassPieces } from "@/features/classes/hooks/useClassPieces";
import { type ApiFieldError } from "@/features/classes/types/classTypes";
import { type AssignmentContentPayload, type AssignmentPiece } from "@/features/classes/types/teacherAssignmentTypes";
import { ASSIGNMENT_KIND_LABELS } from "@/features/classes/utils/teacherAssignmentFormat";
import { applyFieldErrors } from "@/features/classes/utils/mapApiErrors";
import {
  ASSIGNMENT_DESCRIPTION_MAX,
  ASSIGNMENT_TITLE_MAX,
  assignmentFormSchema,
  type AssignmentFormValues,
  toAssignmentContent,
} from "@/features/classes/utils/validateAssignment";
import { cn } from "@/shared/utils/cn";

const FORM_FIELDS = ["classId", "title", "kind", "description", "pieceId", "requiredBpm"] as const;

interface AssignmentFormProps {
  mode: "create" | "edit";
  initialValues: AssignmentFormValues;
  classes: Array<{ id: string; name: string }>;
  // Edit mode: the stored piece, shown even if it has since been hidden from the library.
  currentPiece?: AssignmentPiece | null;
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
  currentPiece = null,
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
  const pieceId = useWatch({ control, name: "pieceId" });
  const title = useWatch({ control, name: "title" }) ?? "";
  const description = useWatch({ control, name: "description" }) ?? "";
  const { pieces } = useClassPieces(classId);
  const selectedPiece = pieces.find((piece) => piece.id === pieceId);
  const isCurrentPieceMissing = Boolean(currentPiece && !pieces.some((piece) => piece.id === currentPiece.id));
  const pieceField = register("pieceId");
  const className = classes.find((item) => item.id === classId)?.name ?? "";

  const submitWith = (publish: boolean) =>
    handleSubmit(async (values) => {
      const fieldErrors = await onSubmit({ classId: values.classId, ...toAssignmentContent(values) }, publish);
      if (fieldErrors) applyFieldErrors<AssignmentFormValues>(fieldErrors, FORM_FIELDS, setError);
    });

  return (
    <form onSubmit={submitWith(!isEdit)} noValidate className="flex grow flex-col">
      <div className="flex grow flex-col gap-[16px] px-[18px] pb-[18px] pt-[6px] md:max-w-2xl">
        <FormField id="assignment-class" label="Lớp" isRequired error={errors.classId?.message}>
          {isEdit ? (
            <input id="assignment-class" value={className} readOnly className={INPUT_CLASSES} />
          ) : (
            <select
              id="assignment-class"
              // A piece belongs to one instrument: changing class clears it.
              {...register("classId", { onChange: () => setValue("pieceId", "") })}
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
        <FormField id="assignment-piece" label="Bài nhạc" error={errors.pieceId?.message}>
          <select
            id="assignment-piece"
            // Controlled: options arrive after mount, so an uncontrolled select would fall back to "Không chọn".
            {...pieceField}
            value={pieceId}
            aria-invalid={Boolean(errors.pieceId)}
            className={INPUT_CLASSES}
          >
            <option value="">Không chọn</option>
            {isCurrentPieceMissing && currentPiece && (
              <option value={currentPiece.id}>
                {currentPiece.isAvailable ? currentPiece.title : `${currentPiece.title} (Không còn khả dụng)`}
              </option>
            )}
            {pieces.map((piece) => (
              <option key={piece.id} value={piece.id}>
                {piece.title}
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
            placeholder={selectedPiece?.defaultBpm ? `Mặc định: ${selectedPiece.defaultBpm}` : undefined}
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
