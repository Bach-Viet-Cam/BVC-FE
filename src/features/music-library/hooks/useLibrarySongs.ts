import { useCallback } from "react";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { musicLibraryApi } from "@/features/music-library/api/musicLibraryApi";
import type { LibrarySongQuery } from "@/features/music-library/types/musicLibraryTypes";

export function useLibrarySongs(query: LibrarySongQuery) {
  const { data, error, isLoading, isFirstLoad, reload, mutate } = useAsyncData(
    () => musicLibraryApi.listLibrarySongs(query),
    `library-songs:${JSON.stringify(query)}`,
    undefined,
    { cache: true }
  );

  const setSongSaved = useCallback(
    (songId: string, isSaved: boolean) =>
      mutate((current) => ({
        ...current,
        data: current.data.map((song) => (song.id === songId ? { ...song, isSaved } : song)),
      })),
    [mutate]
  );

  return { result: data, error, isLoading, isFirstLoad, reload, setSongSaved };
}
