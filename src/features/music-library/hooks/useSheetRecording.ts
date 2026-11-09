import { musicLibraryApi } from "@/features/music-library/api/musicLibraryApi";
import type { MediaFile, SheetVersion } from "@/features/music-library/types/musicLibraryTypes";
import { useAsyncData } from "@/shared/hooks/useAsyncData";

export function useSheetRecording(sheet: SheetVersion): MediaFile | undefined {
  const needsUrl = Boolean(sheet.referenceRecording && !sheet.referenceRecording.url);
  const { data } = useAsyncData<MediaFile | null>(
    () =>
      needsUrl
        ? musicLibraryApi
            .getSheetViewer(sheet.songId, sheet.id)
            .then((viewer) => viewer.sheet.referenceRecording ?? null)
        : Promise.resolve(null),
    needsUrl ? `sheet-recording:${sheet.id}` : "sheet-recording:none",
    undefined,
    { cache: true }
  );
  return data ?? sheet.referenceRecording;
}
