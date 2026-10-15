import { useCallback, useState } from "react";
import { toast } from "@/shared/components/ui/toast";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { musicLibraryApi } from "@/features/music-library/api/musicLibraryApi";
import type { EditableVisibility, SheetPayload, SheetVersion } from "@/features/music-library/types/musicLibraryTypes";

export type SheetAsset = "sheetFile" | "referenceRecording" | "tutorialVideo";

const ASSET_LABELS: Record<SheetAsset, string> = {
  sheetFile: "file bản nhạc",
  referenceRecording: "bản thu mẫu",
  tutorialVideo: "video hướng dẫn",
};

function payloadFrom(sheet: SheetVersion, overrides: Partial<SheetPayload> = {}): SheetPayload {
  return {
    name: sheet.name,
    description: sheet.description,
    instrumentId: sheet.instrument.id,
    levelId: sheet.level.id,
    isMain: sheet.isMain,
    visibility: sheet.visibility === "VISIBLE" ? "VISIBLE" : "HIDDEN",
    sheetFile: null,
    referenceRecording: null,
    tutorialVideo: null,
    ...overrides,
  };
}

export function useSongSheets(songId: string) {
  const { data, error, isFirstLoad, isLoading, reload } = useAsyncData(
    () => musicLibraryApi.getSongSheets(songId),
    `song-sheets:${songId}`
  );
  const [busySheetId, setBusySheetId] = useState<string | null>(null);

  const runOnSheet = useCallback(
    async (sheetId: string, action: () => Promise<unknown>, successMessage: string) => {
      setBusySheetId(sheetId);
      try {
        await action();
        toast.success(successMessage);
        reload();
      } catch (actionError) {
        toast.error("Không cập nhật được bản nhạc", getErrorMessage(actionError));
      } finally {
        setBusySheetId(null);
      }
    },
    [reload]
  );

  const saveSheet = useCallback(
    async (payload: SheetPayload, editingId?: string) => {
      const saved = editingId
        ? await musicLibraryApi.updateSheet(editingId, payload)
        : await musicLibraryApi.createSheet(songId, payload);
      toast.success(editingId ? "Đã lưu bản nhạc" : "Đã thêm bản nhạc", saved.name);
      reload();
      return saved;
    },
    [reload, songId]
  );

  const replaceAsset = useCallback(
    (sheet: SheetVersion, asset: SheetAsset, file: File) =>
      runOnSheet(
        sheet.id,
        () => musicLibraryApi.updateSheet(sheet.id, payloadFrom(sheet, { [asset]: file })),
        `Đã cập nhật ${ASSET_LABELS[asset]}`
      ),
    [runOnSheet]
  );

  const changeVisibility = useCallback(
    (sheet: SheetVersion, visibility: EditableVisibility) =>
      runOnSheet(
        sheet.id,
        () => musicLibraryApi.setSheetVisibility(sheet.id, visibility),
        visibility === "VISIBLE" ? "Đã công khai bản nhạc" : "Đã ẩn bản nhạc"
      ),
    [runOnSheet]
  );

  return {
    song: data?.song,
    sheets: data?.sheets ?? [],
    error,
    isFirstLoad,
    isRefreshing: isLoading && !isFirstLoad,
    reload,
    saveSheet,
    replaceAsset,
    changeVisibility,
    busySheetId,
  };
}
