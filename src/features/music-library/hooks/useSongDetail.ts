import { useCallback } from "react";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { musicLibraryApi } from "@/features/music-library/api/musicLibraryApi";

export function useSongDetail(songId: string) {
  const { data, error, isFirstLoad, reload, mutate } = useAsyncData(
    () => musicLibraryApi.getLibrarySong(songId),
    `library-song:${songId}`
  );

  const setSongSaved = useCallback((isSaved: boolean) => mutate((current) => ({ ...current, isSaved })), [mutate]);

  return { song: data, error, isLoading: isFirstLoad, reload, setSongSaved };
}
