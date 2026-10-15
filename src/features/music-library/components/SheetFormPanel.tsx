import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AudioLines, FileText, Video, X } from "lucide-react";
import { ActionButton } from "@/shared/components/bvc/ActionButton";
import { ChoiceCards } from "@/shared/components/bvc/ChoiceCards";
import { FileField } from "@/shared/components/bvc/FileField";
import { FormField } from "@/shared/components/bvc/FormField";
import { fieldClass } from "@/shared/components/bvc/fieldStyles";
import type { SelectOption } from "@/shared/types/commonTypes";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { EDITABLE_VISIBILITY_OPTIONS, FILE_RULES } from "@/features/music-library/constants/musicLibraryConstants";
import type { ManagedSong, SheetPayload, SheetVersion } from "@/features/music-library/types/musicLibraryTypes";
import { formatDuration, formatFileSize } from "@/features/music-library/utils/mediaUtils";
import { createSheetSchema, type SheetFormValues } from "@/features/music-library/utils/validateSheet";

interface SheetFormPanelProps {
  song: ManagedSong;
  sheets: SheetVersion[];
  editing?: SheetVersion;
  presetInstrumentId?: string;
  levelOptions: SelectOption[];
  onCancel: () => void;
  onSubmit: (payload: SheetPayload, editingId?: string) => Promise<unknown>;
}

type SheetKind = "main" | "variant";

// Quy tắc bản chính: bản đầu tiên của nhạc cụ bắt buộc là bản chính, mỗi nhạc cụ chỉ 1 bản chính
function mainRuleFor(instrumentId: string, sheets: SheetVersion[], editing?: SheetVersion) {
  const siblings = sheets.filter((sheet) => sheet.instrument.id === instrumentId && sheet.id !== editing?.id);
  const hasOtherMain = siblings.some((sheet) => sheet.isMain);
  return {
    mustBeMain: !hasOtherMain,
    canBeMain: !hasOtherMain,
    isFirst: siblings.length === 0,
  };
}

function pickDefaultInstrument(song: ManagedSong, sheets: SheetVersion[], preset?: string) {
  if (preset && song.instruments.some((instrument) => instrument.id === preset)) return preset;
  const withoutMain = song.instruments.find(
    (instrument) => !sheets.some((sheet) => sheet.instrument.id === instrument.id && sheet.isMain)
  );
  return withoutMain?.id ?? song.instruments[0]?.id ?? "";
}

export function SheetFormPanel({
  song,
  sheets,
  editing,
  presetInstrumentId,
  levelOptions,
  onCancel,
  onSubmit,
}: SheetFormPanelProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const schema = useMemo(
    () =>
      createSheetSchema({
        siblingNames: sheets.filter((sheet) => sheet.id !== editing?.id).map((sheet) => sheet.name),
        hasExistingSheetFile: Boolean(editing?.sheetFile),
        hasExistingRecording: Boolean(editing?.referenceRecording),
      }),
    [sheets, editing]
  );

  const initialInstrumentId = editing?.instrument.id ?? pickDefaultInstrument(song, sheets, presetInstrumentId);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SheetFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: editing?.name ?? "",
      description: editing?.description ?? "",
      instrumentId: initialInstrumentId,
      levelId: editing?.level.id ?? song.level.id,
      isMain: editing?.isMain ?? mainRuleFor(initialInstrumentId, sheets).mustBeMain,
      visibility: editing?.visibility === "VISIBLE" ? "VISIBLE" : "HIDDEN",
      sheetFile: null,
      referenceRecording: null,
      tutorialVideo: null,
    },
  });

  const instrumentId = useWatch({ control, name: "instrumentId" });
  const isMain = useWatch({ control, name: "isMain" });
  const visibility = useWatch({ control, name: "visibility" });
  const sheetFile = useWatch({ control, name: "sheetFile" });
  const recordingFile = useWatch({ control, name: "referenceRecording" });
  const videoFile = useWatch({ control, name: "tutorialVideo" });

  const instrumentName = song.instruments.find((instrument) => instrument.id === instrumentId)?.name ?? "Nhạc cụ này";
  const rule = mainRuleFor(instrumentId, sheets, editing);
  const kindHint = rule.isFirst
    ? `${instrumentName} chưa có bản nào nên bản này là bản chính.`
    : rule.mustBeMain
      ? `${instrumentName} chưa có bản chính nên bản này phải là bản chính.`
      : `${instrumentName} đã có bản chính.`;

  const instrumentOptions =
    song.instruments.some((instrument) => instrument.id === editing?.instrument.id) || !editing
      ? song.instruments
      : [...song.instruments, editing.instrument];

  const submit = async (values: SheetFormValues) => {
    setSubmitError(null);
    try {
      await onSubmit(values, editing?.id);
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Không lưu được bản nhạc."));
    }
  };

  const recordingDuration = recordingFile ? undefined : editing?.referenceRecording?.durationSec;

  return (
    <aside
      aria-label={editing ? `Sửa bản nhạc ${editing.name}` : "Thêm bản nhạc"}
      className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-white lg:static lg:z-auto lg:w-[400px] lg:shrink-0 lg:border-l lg:border-bvc-border"
    >
      <div className="flex items-start gap-3 px-[18px] pt-6 pb-2 lg:px-[26px]">
        <div className="flex flex-1 flex-col gap-1">
          <span className="text-xs font-bold tracking-[0.08em] text-bvc-muted uppercase">
            {editing ? "Sửa bản nhạc" : "Thêm bản nhạc"} · {song.title}
          </span>
          <h2 className="text-xl font-extrabold text-bvc-ink">{editing?.name ?? "Bản nhạc mới"}</h2>
        </div>
        <button
          type="button"
          aria-label="Đóng"
          onClick={onCancel}
          className="flex size-10 cursor-pointer items-center justify-center rounded-xl text-bvc-ink hover:bg-bvc-surface"
        >
          <X className="size-5" />
        </button>
      </div>

      <form
        noValidate
        onSubmit={handleSubmit(submit)}
        className="flex flex-1 flex-col gap-3.5 px-[18px] pb-6 lg:px-[26px]"
      >
        <div className="grid grid-cols-2 gap-2.5">
          <FormField label="Nhạc cụ" htmlFor="sheet-instrument" required error={errors.instrumentId?.message}>
            <select
              {...register("instrumentId", {
                onChange: (event: { target: { value: string } }) => {
                  const next = mainRuleFor(event.target.value, sheets, editing);
                  setValue("isMain", next.mustBeMain);
                },
              })}
              id="sheet-instrument"
              className={fieldClass(Boolean(errors.instrumentId), "h-[46px]")}
            >
              {instrumentOptions.map((instrument) => (
                <option key={instrument.id} value={instrument.id}>
                  {instrument.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Trình độ" htmlFor="sheet-level" required error={errors.levelId?.message}>
            <select
              {...register("levelId")}
              id="sheet-level"
              className={fieldClass(Boolean(errors.levelId), "h-[46px]")}
            >
              {levelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Loại bản" hint={`${kindHint} Mỗi bài, mỗi nhạc cụ chỉ có 1 bản chính.`}>
          <ChoiceCards<SheetKind>
            name="sheet-kind"
            label="Loại bản"
            value={isMain ? "main" : "variant"}
            options={[
              { value: "main", label: "Bản chính", disabled: !rule.canBeMain },
              { value: "variant", label: "Theo độ khó", disabled: rule.mustBeMain },
            ]}
            onChange={(kind) => setValue("isMain", kind === "main", { shouldValidate: true })}
          />
        </FormField>

        <FormField
          label="Tên bản"
          htmlFor="sheet-name"
          required
          hint="1–100 ký tự · không trùng trong cùng bài"
          error={errors.name?.message}
        >
          <input
            {...register("name")}
            id="sheet-name"
            maxLength={100}
            placeholder={`${instrumentName} — ${isMain ? "bản chính" : "bản cơ bản"}`}
            className={fieldClass(Boolean(errors.name), "h-[46px]")}
          />
        </FormField>

        <FormField
          label="Mô tả"
          htmlFor="sheet-description"
          hint="Tối đa 500 ký tự"
          error={errors.description?.message}
        >
          <textarea
            {...register("description")}
            id="sheet-description"
            rows={2}
            maxLength={500}
            className={fieldClass(Boolean(errors.description), "resize-none py-2.5")}
          />
        </FormField>

        <FormField
          label="File bản nhạc"
          required
          hint="PDF, PNG hoặc JPG · theo cấu hình Admin"
          error={errors.sheetFile?.message}
        >
          <FileField
            ariaLabel="Chọn file bản nhạc"
            accept={FILE_RULES.sheet.accept}
            icon={<FileText className="size-4" strokeWidth={1.8} />}
            emptyLabel="Chọn file PDF, PNG, JPG"
            currentName={sheetFile?.name ?? editing?.sheetFile.name}
            currentMeta={formatFileSize(sheetFile?.size ?? editing?.sheetFile.sizeBytes)}
            hasError={Boolean(errors.sheetFile)}
            onSelect={(file) => setValue("sheetFile", file, { shouldValidate: true })}
          />
        </FormField>

        <FormField
          label="Bản thu mẫu"
          required={isMain && visibility === "VISIBLE"}
          hint="Bắt buộc với bản chính khi công khai, tùy chọn với bản theo độ khó · MP3, WAV, M4A"
          error={errors.referenceRecording?.message}
        >
          <FileField
            ariaLabel="Chọn bản thu mẫu"
            accept={FILE_RULES.recording.accept}
            icon={<AudioLines className="size-4" strokeWidth={1.8} />}
            emptyLabel="Chọn file MP3, WAV, M4A"
            currentName={recordingFile?.name ?? editing?.referenceRecording?.name}
            currentMeta={recordingDuration !== undefined ? formatDuration(recordingDuration) : undefined}
            hasError={Boolean(errors.referenceRecording)}
            onSelect={(file) => setValue("referenceRecording", file, { shouldValidate: true })}
          />
        </FormField>

        <FormField label="Video hướng dẫn" hint="Không bắt buộc · MP4" error={errors.tutorialVideo?.message}>
          <FileField
            ariaLabel="Chọn video hướng dẫn"
            accept={FILE_RULES.video.accept}
            icon={<Video className="size-4" strokeWidth={1.8} />}
            emptyLabel="Chọn file MP4"
            currentName={videoFile?.name ?? editing?.tutorialVideo?.name}
            hasError={Boolean(errors.tutorialVideo)}
            onSelect={(file) => setValue("tutorialVideo", file, { shouldValidate: true })}
          />
        </FormField>

        <div className="flex items-baseline justify-between rounded-[13px] bg-bvc-surface px-3.5 py-2.5">
          <span className="text-[13.5px] font-semibold text-bvc-ink">Thời lượng</span>
          <span className="text-right text-[12.5px] text-bvc-muted">
            {recordingFile ? (
              "Tự tính sau khi lưu"
            ) : recordingDuration !== undefined ? (
              <span className="font-bvc-mono text-bvc-ink">{formatDuration(recordingDuration)}</span>
            ) : (
              "Tự tính khi có bản thu mẫu"
            )}
          </span>
        </div>

        <FormField label="Hiển thị">
          <ChoiceCards
            name="sheet-visibility"
            label="Hiển thị"
            value={visibility}
            options={EDITABLE_VISIBILITY_OPTIONS}
            disabled={editing?.visibility === "HIDDEN_BY_ADMIN"}
            onChange={(next) => setValue("visibility", next, { shouldValidate: true })}
          />
        </FormField>

        {submitError && (
          <p role="alert" className="rounded-[13px] bg-bvc-accent-tint px-3.5 py-3 text-[13px] text-bvc-accent-text">
            {submitError}
          </p>
        )}

        <div className="sticky bottom-0 mt-auto flex gap-2 bg-white pt-3">
          <ActionButton variant="secondary" className="flex-1" onClick={onCancel}>
            Hủy
          </ActionButton>
          <ActionButton type="submit" className="flex-1" isLoading={isSubmitting}>
            Lưu
          </ActionButton>
        </div>
      </form>
    </aside>
  );
}
