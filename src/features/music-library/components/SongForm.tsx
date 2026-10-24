import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TriangleAlert } from "lucide-react";
import { FormField } from "@/shared/components/bvc/FormField";
import { Chip } from "@/shared/components/bvc/Chip";
import { ChoiceCards } from "@/shared/components/bvc/ChoiceCards";
import { fieldClass } from "@/shared/components/bvc/fieldStyles";
import type { SelectOption } from "@/shared/types/commonTypes";
import { CoverPicker } from "@/features/music-library/components/CoverPicker";
import {
  EDITABLE_VISIBILITY_OPTIONS,
  LIBRARY_MESSAGES,
} from "@/features/music-library/constants/musicLibraryConstants";
import type { LecturerPiece } from "@/features/music-library/types/lecturerTypes";
import { withCurrentOptions } from "@/features/music-library/utils/categoryOptions";
import { coverToneOf } from "@/features/music-library/utils/coverTone";
import type { FormFailure } from "@/features/music-library/utils/formFailure";
import { songSchema, type SongFormValues } from "@/features/music-library/utils/validateSong";

interface SongFormProps {
  formId: string;
  song?: LecturerPiece;
  options: { genres: SelectOption[] };
  onSubmit: (values: SongFormValues) => Promise<FormFailure<keyof SongFormValues> | null>;
}

function defaultValuesOf(song?: LecturerPiece): SongFormValues {
  return {
    title: song?.title ?? "",
    composer: song?.composer ?? "",
    description: song?.description ?? "",
    genreId: song?.genre.id ?? "",
    // Bài mới mặc định ẩn
    visibility: song?.visibility ?? "HIDDEN",
    coverFile: null,
    removeCover: false,
  };
}

export function SongForm({ formId, song, options, onSubmit }: SongFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors },
  } = useForm<SongFormValues>({
    resolver: zodResolver(songSchema),
    defaultValues: defaultValuesOf(song),
  });
  const selectOptions = useMemo(
    () => ({
      genres: withCurrentOptions(options.genres, song ? [song.genre] : []),
    }),
    [options, song]
  );

  const submit = async (values: SongFormValues) => {
    const failure = await onSubmit(values);
    if (failure?.field) setError(failure.field, { message: failure.message }, { shouldFocus: true });
  };

  const title = useWatch({ control, name: "title" });
  const visibility = useWatch({ control, name: "visibility" });
  const coverFile = useWatch({ control, name: "coverFile" });
  const removeCover = useWatch({ control, name: "removeCover" });
  const descriptionLength = useWatch({ control, name: "description" }).length;
  const lockedByAdmin = song?.canChangeVisibility === false;
  const showNoSheetWarning = visibility === "PUBLIC" && !lockedByAdmin && (song?.publicSheetMusicCount ?? 0) === 0;

  return (
    <form
      id={formId}
      noValidate
      onSubmit={handleSubmit(submit)}
      className="grid gap-8 px-[18px] py-6 md:px-8 md:py-7 lg:grid-cols-[240px_minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-10 xl:grid-cols-[280px_minmax(0,1fr)_minmax(0,1fr)]"
    >
      <CoverPicker
        title={title}
        tone={song ? coverToneOf(song.id) : "ink"}
        currentUrl={song?.coverUrl ?? undefined}
        file={coverFile}
        isRemoved={removeCover}
        error={errors.coverFile?.message}
        onSelect={(file) => {
          setValue("coverFile", file, { shouldValidate: true, shouldDirty: true });
          setValue("removeCover", false);
        }}
        onRemove={() => {
          setValue("coverFile", null, { shouldValidate: true, shouldDirty: true });
          setValue("removeCover", true, { shouldDirty: true });
        }}
      />

      <section className="flex flex-col gap-3.5">
        <h2 className="text-base font-extrabold text-bvc-ink">Thông tin cơ bản</h2>
        <FormField label="Tiêu đề" htmlFor="song-title" required hint="1–200 ký tự" error={errors.title?.message}>
          <input
            {...register("title")}
            id="song-title"
            maxLength={200}
            className={fieldClass(Boolean(errors.title), "h-[46px]")}
          />
        </FormField>
        <FormField label="Tác giả" htmlFor="song-composer" hint="Tối đa 200 ký tự" error={errors.composer?.message}>
          <input
            {...register("composer")}
            id="song-composer"
            maxLength={200}
            placeholder="Ví dụ: Dân gian, Hoàng Vân"
            className={fieldClass(Boolean(errors.composer), "h-[46px]")}
          />
        </FormField>
        <FormField
          label="Mô tả"
          htmlFor="song-description"
          hint={`${descriptionLength}/1.000 ký tự`}
          error={errors.description?.message}
        >
          <textarea
            {...register("description")}
            id="song-description"
            rows={4}
            maxLength={1000}
            className={fieldClass(Boolean(errors.description), "resize-none py-[11px] leading-relaxed")}
          />
        </FormField>
      </section>

      <div className="flex flex-col gap-7">
        <section className="flex flex-col gap-3.5">
          <h2 className="text-base font-extrabold text-bvc-ink">Phân loại</h2>
          <FormField
            label="Thể loại"
            htmlFor="song-genre"
            required
            hint="Từ danh mục thể loại đang bật"
            error={errors.genreId?.message}
          >
            <select
              {...register("genreId")}
              id="song-genre"
              className={fieldClass(Boolean(errors.genreId), "h-[46px]")}
            >
              <option value="">Chọn thể loại</option>
              {selectOptions.genres.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Nhạc cụ" hint="Tự lấy từ nhạc cụ của các bản nhạc trong bài, không chọn ở đây">
            <p className="flex min-h-[46px] flex-wrap items-center gap-1.5 rounded-[13px] bg-bvc-surface px-[13px] py-2 text-[14px] text-bvc-muted">
              {song?.instruments.length
                ? song.instruments.map((instrument) => <Chip key={instrument.id}>{instrument.name}</Chip>)
                : "Chưa có bản nhạc nào"}
            </p>
          </FormField>
        </section>

        <section className="flex flex-col gap-3.5">
          <h2 className="text-base font-extrabold text-bvc-ink">Trạng thái</h2>
          <FormField
            label="Hiển thị"
            error={errors.visibility?.message}
            hint={
              lockedByAdmin
                ? `${LIBRARY_MESSAGES.hiddenByAdmin}${song?.moderationReason ? ` Lý do: ${song.moderationReason}` : ""}`
                : "Bài mới mặc định ở trạng thái ẩn. Chọn công khai khi chưa có bản nhạc nào công khai sẽ hiện cảnh báo."
            }
          >
            <ChoiceCards
              name="visibility"
              label="Hiển thị"
              value={visibility}
              options={EDITABLE_VISIBILITY_OPTIONS}
              disabled={lockedByAdmin}
              onChange={(next) => setValue("visibility", next, { shouldDirty: true })}
            />
          </FormField>
          {showNoSheetWarning && (
            <p
              role="status"
              className="flex gap-2.5 rounded-[13px] bg-bvc-accent-tint px-3.5 py-3 text-[13px] leading-snug text-bvc-accent-text"
            >
              <TriangleAlert className="mt-px size-4 shrink-0" aria-hidden />
              {LIBRARY_MESSAGES.noVisibleSheet}
            </p>
          )}
        </section>
      </div>
    </form>
  );
}
