import { useCallback, useState } from "react";
import { toast } from "@/shared/components/ui/toast";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { musicLibraryApi } from "@/features/music-library/api/musicLibraryApi";
import type {
  EditableVisibility,
  ManagedSong,
  ManagedSongQuery,
} from "@/features/music-library/types/musicLibraryTypes";

export const INITIAL_MANAGED_QUERY: ManagedSongQuery = {
  keyword: "",
  genreId: "",
  instrumentId: "",
  levelId: "",
  visibility: "",
  page: 1,
};

export function useManagedSongs() {
  const [query, setQuery] = useState<ManagedSongQuery>(INITIAL_MANAGED_QUERY);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { data, error, isLoading, isFirstLoad, reload, mutate } = useAsyncData(
    () => musicLibraryApi.listMySongs(query),
    `my-songs:${JSON.stringify(query)}`
  );

  // Đổi bộ lọc thì về trang 1
  const updateQuery = useCallback((changes: Partial<ManagedSongQuery>) => {
    setQuery((current) => ({ ...current, page: 1, ...changes }));
  }, []);

  const changeVisibility = useCallback(
    async (song: ManagedSong, visibility: EditableVisibility) => {
      setUpdatingId(song.id);
      try {
        const updated = await musicLibraryApi.setSongVisibility(song.id, visibility);
        mutate((current) => ({
          ...current,
          data: current.data.map((item) => (item.id === updated.id ? updated : item)),
        }));
        toast.success(visibility === "VISIBLE" ? "Đã công khai bài hát" : "Đã ẩn bài hát", song.title);
      } catch (changeError) {
        toast.error("Không đổi được trạng thái", getErrorMessage(changeError));
      } finally {
        setUpdatingId(null);
      }
    },
    [mutate]
  );

  return {
    query,
    updateQuery,
    result: data,
    error,
    isLoading,
    isFirstLoad,
    reload,
    changeVisibility,
    updatingId,
  };
}
