import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/shared/components/ui/toast";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { lecturerApi } from "@/features/music-library/api/lecturerApi";
import type { LecturerPiece, PieceRequest } from "@/features/music-library/types/lecturerTypes";
import { toFormFailure, uploadForField, type FormFailure } from "@/features/music-library/utils/formFailure";
import type { SongFormValues } from "@/features/music-library/utils/validateSong";

const LOAD_ERROR = "Không mở được bài hát. Vui lòng thử lại.";
const SAVE_ERROR = "Không lưu được bài hát. Vui lòng thử lại.";

// Trường BE trả trong lỗi → ô trên form
const FIELD_MAP: Partial<Record<string, keyof SongFormValues>> = {
  title: "title",
  composer: "composer",
  description: "description",
  genreId: "genreId",
  levelId: "levelId",
  visibility: "visibility",
  coverFileId: "coverFile",
};

// songId rỗng = tạo mới
export function useSongEditor(songId?: string) {
  const navigate = useNavigate();
  const isEditing = Boolean(songId);
  const [isSubmitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { data, error, isFirstLoad } = useAsyncData<LecturerPiece | null>(
    () => (songId ? lecturerApi.getPiece(songId).then(({ data: body }) => body.data) : Promise.resolve(null)),
    `song-editor:${songId ?? "new"}`,
    LOAD_ERROR
  );

  // null = lưu xong; có lỗi thì trả về để form tô đỏ đúng ô
  const submit = async (values: SongFormValues): Promise<FormFailure<keyof SongFormValues> | null> => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const cover = values.coverFile ? await uploadForField("coverFileId", "COVER", values.coverFile) : null;
      const request: PieceRequest = {
        title: values.title,
        composer: values.composer || null,
        description: values.description || null,
        genreId: values.genreId,
        levelId: values.levelId,
        // Admin đã ẩn thì không gửi để BE giữ nguyên (GBR-45)
        visibility: data?.canChangeVisibility === false ? undefined : values.visibility,
        coverFileId: cover ? cover.id : values.removeCover ? null : undefined,
      };
      const { data: body } = songId
        ? await lecturerApi.updatePiece(songId, request)
        : await lecturerApi.createPiece(request);
      toast.success(body.message, body.data.piece.title);
      if (body.data.warning) toast.info("Lưu ý", body.data.warning.message);
      navigate("/songs");
      return null;
    } catch (saveError) {
      const failure = toFormFailure(saveError, SAVE_ERROR, FIELD_MAP);
      if (!failure.field) setSubmitError(failure.message);
      return failure;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    song: data ?? undefined,
    isEditing,
    isLoading: isFirstLoad,
    loadError: error,
    submit,
    isSubmitting,
    submitError,
  };
}
