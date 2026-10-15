import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/shared/components/ui/toast";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { musicLibraryApi } from "@/features/music-library/api/musicLibraryApi";
import type { ManagedSong } from "@/features/music-library/types/musicLibraryTypes";
import type { SongFormValues } from "@/features/music-library/utils/validateSong";

// songId rỗng = tạo mới
export function useSongEditor(songId?: string) {
  const navigate = useNavigate();
  const isEditing = Boolean(songId);
  const [isSubmitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { data, error, isFirstLoad } = useAsyncData<ManagedSong | null>(
    () => (songId ? musicLibraryApi.getMySong(songId) : Promise.resolve(null)),
    `song-editor:${songId ?? "new"}`
  );

  const submit = async (values: SongFormValues) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const saved = songId
        ? await musicLibraryApi.updateSong(songId, values)
        : await musicLibraryApi.createSong(values);
      toast.success(isEditing ? "Đã lưu bài hát" : "Đã tạo bài hát", saved.title);
      navigate("/songs");
    } catch (saveError) {
      setSubmitError(getErrorMessage(saveError, "Không lưu được bài hát. Vui lòng thử lại."));
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
