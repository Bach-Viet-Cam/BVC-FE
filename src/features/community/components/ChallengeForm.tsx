import { useRef, useState } from "react";
import { useForm, useWatch, type Path, type PathValue, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { ActionButton } from "@/features/classes/components/ActionButton";
import { ConfirmDialog } from "@/features/classes/components/ConfirmDialog";
import { FooterActions } from "@/features/classes/components/FooterActions";
import { FormField, INPUT_CLASSES } from "@/features/classes/components/FormField";
import { type ClassSummary, type Instrument } from "@/features/classes/types/classTypes";
import { applyFieldErrors } from "@/features/classes/utils/mapApiErrors";
import { ChallengePiecePickerDialog } from "@/features/community/components/ChallengePiecePickerDialog";
import { ClassMultiSelect } from "@/features/community/components/ClassMultiSelect";
import { WeekPicker } from "@/features/community/components/WeekPicker";
import { useSaveChallenge } from "@/features/community/hooks/useSaveChallenge";
import { type Challenge, type ChallengePiece } from "@/features/community/types/challenge";
import {
  CHALLENGE_DESCRIPTION_MAX,
  CHALLENGE_TITLE_MAX,
  challengeSchema,
  EMPTY_CHALLENGE_FORM,
  publishChallengeSchema,
  toChallengeFormValues,
  type ChallengeFormValues,
} from "@/features/community/utils/validateChallenge";
import { toast } from "@/shared/components/ui/toast";
import { cn } from "@/shared/utils/cn";

const LIST_PATH = "/teacher/challenges";
const FORM_FIELDS = [
  "title",
  "description",
  "instrumentId",
  "pieceId",
  "classIds",
  "weekStart",
  "minAccuracy",
  "requiredBpm",
  "maxSubmissions",
] as const;

interface ChallengeFormProps {
  // Edit mode: the stored draft. Omit to create.
  challenge?: Challenge | null;
  classes: ClassSummary[];
  instruments: Instrument[];
  defaultMinAccuracy: number;
  maxSubmissionsDefault: number;
}

export function ChallengeForm({
  challenge = null,
  classes,
  instruments,
  defaultMinAccuracy,
  maxSubmissionsDefault,
}: ChallengeFormProps) {
  const navigate = useNavigate();
  const { saveChallenge, isSaving } = useSaveChallenge(challenge?.id);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  // Publishing validates more fields than a draft; a ref picks the schema without extra renders.
  const isPublishingRef = useRef(false);
  const isReadOnly = challenge !== null && challenge.status !== "DRAFT";

  const resolver: Resolver<ChallengeFormValues> = (values, context, options) =>
    zodResolver(isPublishingRef.current ? publishChallengeSchema : challengeSchema)(values, context, options);

  const defaultValues = challenge
    ? toChallengeFormValues(challenge)
    : {
        ...EMPTY_CHALLENGE_FORM,
        minAccuracy: String(defaultMinAccuracy),
        maxSubmissions: String(maxSubmissionsDefault),
      };

  const {
    control,
    register,
    handleSubmit,
    setError,
    setValue,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm<ChallengeFormValues>({ resolver, defaultValues });
  const title = useWatch({ control, name: "title" }) ?? "";
  const description = useWatch({ control, name: "description" }) ?? "";
  const instrumentId = useWatch({ control, name: "instrumentId" });
  const pieceId = useWatch({ control, name: "pieceId" });
  const pieceTitle = useWatch({ control, name: "pieceTitle" });
  const pieceBpm = useWatch({ control, name: "pieceBpm" });
  const classIds = useWatch({ control, name: "classIds" });
  const weekStart = useWatch({ control, name: "weekStart" });

  const update = <TName extends Path<ChallengeFormValues>>(
    name: TName,
    value: PathValue<ChallengeFormValues, TName>
  ) => {
    setValue(name, value, { shouldDirty: true });
    clearErrors(name);
  };

  const instrumentField = register("instrumentId", {
    // A piece and the classes belong to one instrument: changing it clears both.
    onChange: () => {
      update("pieceId", "");
      update("pieceTitle", "");
      update("pieceBpm", "");
      update("classIds", []);
    },
  });

  const choosePiece = (piece: ChallengePiece) => {
    update("pieceId", piece.id);
    update("pieceTitle", piece.title);
    update("pieceBpm", String(piece.bpm));
  };

  const submitWith = (publish: boolean) =>
    handleSubmit(async (values) => {
      const result = await saveChallenge(values, publish);
      if ("challenge" in result) {
        toast.success(result.message);
        navigate(LIST_PATH, { replace: true });
        return;
      }
      const unmatched = applyFieldErrors<ChallengeFormValues>(result.error.fieldErrors, FORM_FIELDS, setError);
      if (result.error.fieldErrors.length === 0) toast.error(result.error.message);
      else for (const fieldError of unmatched) toast.error(fieldError.message);
    });

  const submit = (publish: boolean, event: React.BaseSyntheticEvent) => {
    isPublishingRef.current = publish;
    return submitWith(publish)(event);
  };

  const cancel = () => (isDirty ? setIsLeaveOpen(true) : navigate(LIST_PATH));

  return (
    <form onSubmit={(event) => submit(false, event)} noValidate className="flex grow flex-col">
      <div className="flex grow flex-col gap-[16px] px-[18px] pb-[18px] pt-[6px] lg:m-[22px_32px] lg:max-w-[720px] lg:grow-0 lg:rounded-[20px] lg:border lg:border-bvc-border lg:p-[20px]">
        {isReadOnly && (
          <p role="status" className="rounded-[13px] bg-bvc-soft px-[13px] py-[11px] text-[13.5px] text-bvc-ink">
            Thử thách này đã được đăng nên không thể chỉnh sửa.
          </p>
        )}
        <fieldset disabled={isReadOnly} className="m-0 flex min-w-0 flex-col gap-[16px] border-none p-0">
          <FormField
            id="challenge-title"
            label="Tên thử thách"
            isRequired
            hint={`${title.length} / ${CHALLENGE_TITLE_MAX}`}
            error={errors.title?.message}
          >
            <input
              id="challenge-title"
              {...register("title")}
              aria-invalid={Boolean(errors.title)}
              className={INPUT_CLASSES}
            />
          </FormField>
          <FormField
            id="challenge-description"
            label="Mô tả"
            hint={`${description.length} / ${CHALLENGE_DESCRIPTION_MAX}`}
            error={errors.description?.message}
          >
            <textarea
              id="challenge-description"
              rows={4}
              {...register("description")}
              aria-invalid={Boolean(errors.description)}
              className={cn(INPUT_CLASSES, "h-auto resize-y py-[11px] leading-[1.5]")}
            />
          </FormField>
          <FormField id="challenge-instrument" label="Nhạc cụ" isRequired error={errors.instrumentId?.message}>
            <select
              id="challenge-instrument"
              {...instrumentField}
              aria-invalid={Boolean(errors.instrumentId)}
              className={INPUT_CLASSES}
            >
              <option value="">Chọn nhạc cụ</option>
              {instruments.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField id="challenge-piece" label="Bài nhạc" isRequired error={errors.pieceId?.message}>
            {pieceId ? (
              <div className="flex min-h-[46px] items-center justify-between gap-[10px] rounded-[13px] border border-bvc-border-strong px-[13px] py-[6px]">
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-[14.5px] font-semibold text-bvc-ink">{pieceTitle}</span>
                  {pieceBpm && <span className="text-[12px] text-bvc-muted">{pieceBpm} BPM</span>}
                </div>
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  className="min-h-[44px] shrink-0 cursor-pointer px-[6px] text-[13.5px] font-semibold text-bvc-accent-text underline"
                >
                  Thay đổi
                </button>
              </div>
            ) : (
              <ActionButton onClick={() => setIsPickerOpen(true)} disabled={!instrumentId}>
                Chọn bài nhạc
              </ActionButton>
            )}
          </FormField>
          <FormField id="challenge-classes" label="Lớp" isRequired error={errors.classIds?.message}>
            <ClassMultiSelect
              classes={classes}
              instrumentId={instrumentId}
              value={classIds}
              onChange={(next) => update("classIds", next)}
            />
          </FormField>
          <FormField id="challenge-week" label="Tuần" isRequired error={errors.weekStart?.message}>
            <WeekPicker
              id="challenge-week"
              value={weekStart}
              onChange={(next) => update("weekStart", next)}
              hasError={Boolean(errors.weekStart)}
            />
          </FormField>
          <FormField id="challenge-accuracy" label="Độ chính xác tối thiểu" error={errors.minAccuracy?.message}>
            <input
              id="challenge-accuracy"
              inputMode="numeric"
              {...register("minAccuracy")}
              aria-invalid={Boolean(errors.minAccuracy)}
              className={cn(INPUT_CLASSES, "font-bvc-mono")}
            />
          </FormField>
          <FormField
            id="challenge-bpm"
            label="BPM yêu cầu"
            hint="Bỏ trống để dùng BPM mặc định của bài nhạc"
            error={errors.requiredBpm?.message}
          >
            <input
              id="challenge-bpm"
              inputMode="numeric"
              {...register("requiredBpm")}
              placeholder={pieceBpm ? `Mặc định: ${pieceBpm}` : undefined}
              aria-invalid={Boolean(errors.requiredBpm)}
              className={cn(INPUT_CLASSES, "font-bvc-mono")}
            />
          </FormField>
          <FormField id="challenge-max-submissions" label="Số lần nộp tối đa" error={errors.maxSubmissions?.message}>
            <input
              id="challenge-max-submissions"
              inputMode="numeric"
              {...register("maxSubmissions")}
              aria-invalid={Boolean(errors.maxSubmissions)}
              className={cn(INPUT_CLASSES, "font-bvc-mono")}
            />
          </FormField>
        </fieldset>
      </div>
      <FooterActions>
        <ActionButton size="lg" onClick={cancel} disabled={isSaving}>
          {isReadOnly ? "Quay lại" : "Hủy"}
        </ActionButton>
        {!isReadOnly && (
          <>
            <ActionButton size="lg" onClick={(event) => submit(false, event)} disabled={isSaving}>
              Lưu nháp
            </ActionButton>
            <ActionButton size="lg" variant="primary" onClick={(event) => submit(true, event)} disabled={isSaving}>
              {isSaving ? "Đang lưu…" : "Đăng thử thách"}
            </ActionButton>
          </>
        )}
      </FooterActions>
      <ChallengePiecePickerDialog
        isOpen={isPickerOpen}
        instrumentId={instrumentId}
        onSelect={choosePiece}
        onClose={() => setIsPickerOpen(false)}
      />
      <ConfirmDialog
        isOpen={isLeaveOpen}
        title="Hủy thay đổi?"
        description="Các thay đổi chưa lưu sẽ bị mất."
        confirmLabel="Rời đi"
        onConfirm={() => navigate(LIST_PATH)}
        onCancel={() => setIsLeaveOpen(false)}
      />
    </form>
  );
}
