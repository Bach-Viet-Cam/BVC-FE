import { useCallback } from "react";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { musicLibraryApi } from "@/features/music-library/api/musicLibraryApi";

export function useSheetViewer(songId: string, sheetId: string) {
  const { data, error, isFirstLoad, mutate } = useAsyncData(
    () => musicLibraryApi.getSheetViewer(songId, sheetId),
    `sheet-viewer:${songId}:${sheetId}`
  );

  const setSheetSaved = useCallback(
    (isSaved: boolean) => mutate((current) => ({ ...current, sheet: { ...current.sheet, isSaved } })),
    [mutate]
  );

  return { viewer: data, error, isLoading: isFirstLoad, setSheetSaved };
}
