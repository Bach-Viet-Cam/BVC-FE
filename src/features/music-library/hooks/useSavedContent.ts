import { useCallback, useState } from "react";
import { toast } from "@/shared/components/ui/toast";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { musicLibraryApi } from "@/features/music-library/api/musicLibraryApi";
import type { SavedSheet, SavedSong } from "@/features/music-library/types/musicLibraryTypes";

export function useSavedContent() {
  const songs = useAsyncData(() => musicLibraryApi.listSavedSongs(), "saved-songs");
  const sheets = useAsyncData(() => musicLibraryApi.listSavedSheets(), "saved-sheets");
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const markPending = (id: string, isPending: boolean) =>
    setPendingIds((current) => {
      const next = new Set(current);
      if (isPending) next.add(id);
      else next.delete(id);
      return next;
    });

  const { mutate: mutateSongs } = songs;
  const { mutate: mutateSheets } = sheets;

  const unsaveSong = useCallback(
    async (item: SavedSong) => {
      markPending(item.song.id, true);
      try {
        await musicLibraryApi.unsaveSong(item.song.id);
        mutateSongs((current) => current.filter((entry) => entry.song.id !== item.song.id));
        toast.success("Đã bỏ lưu bài hát", item.song.title);
      } catch (error) {
        toast.error("Không bỏ lưu được", getErrorMessage(error));
      } finally {
        markPending(item.song.id, false);
      }
    },
    [mutateSongs]
  );

  const unsaveSheet = useCallback(
    async (item: SavedSheet) => {
      markPending(item.sheet.id, true);
      try {
        await musicLibraryApi.unsaveSheet(item.sheet.id);
        mutateSheets((current) => current.filter((entry) => entry.sheet.id !== item.sheet.id));
        toast.success("Đã bỏ lưu bản nhạc", item.sheet.name);
      } catch (error) {
        toast.error("Không bỏ lưu được", getErrorMessage(error));
      } finally {
        markPending(item.sheet.id, false);
      }
    },
    [mutateSheets]
  );

  return {
    savedSongs: songs.data,
    savedSheets: sheets.data,
    isLoading: songs.isFirstLoad || sheets.isFirstLoad,
    error: songs.error ?? sheets.error,
    reload: () => {
      songs.reload();
      sheets.reload();
    },
    unsaveSong,
    unsaveSheet,
    isPending: (id: string) => pendingIds.has(id),
  };
}
