import { useCallback, useMemo, useState } from "react";
import { toast } from "@/shared/components/ui/toast";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { lecturerApi } from "@/features/music-library/api/lecturerApi";
import { uploadMediaFile } from "@/features/music-library/api/uploadApi";
import type {
  LecturerSheetMusic,
  SheetFileSlot,
  SheetMusicRequest,
  StoredFile,
  UploadKind,
} from "@/features/music-library/types/lecturerTypes";
import type { EditableVisibility } from "@/features/music-library/types/musicLibraryTypes";
import { toFormFailure, uploadForField, type FormFailure } from "@/features/music-library/utils/formFailure";
import { lecturerSheetGroups } from "@/features/music-library/utils/sheetUtils";
import type { SheetFormValues } from "@/features/music-library/utils/validateSheet";

const LOAD_ERROR = "Tải bản nhạc thất bại. Vui lòng thử lại.";
const SAVE_ERROR = "Không lưu được bản nhạc. Vui lòng thử lại.";

const SLOT_KINDS: Record<SheetFileSlot, UploadKind> = { sheet: "SHEET", audio: "AUDIO", video: "VIDEO" };

// Trường BE trả trong lỗi → ô trên form
const FIELD_MAP: Partial<Record<string, keyof SheetFormValues>> = {
  name: "name",
  description: "description",
  instrumentId: "instrumentId",
  levelId: "levelId",
  kind: "isMain",
  visibility: "visibility",
  sheetFileId: "sheetFile",
  referenceAudioId: "referenceRecording",
  tutorialVideoId: "tutorialVideo",
};

export function useSongSheets(songId: string) {
  const { data, error, isFirstLoad, isLoading, reload } = useAsyncData(
    () =>
      Promise.all([lecturerApi.getPiece(songId), lecturerApi.listSheetMusic(songId)]).then(([piece, list]) => ({
        piece: piece.data.data,
        list: list.data.data,
      })),
    `song-sheets:${songId}`,
    LOAD_ERROR
  );
  const [busySheetId, setBusySheetId] = useState<string | null>(null);

  const groups = useMemo(() => (data ? lecturerSheetGroups(data.list) : []), [data]);
  const sheets = useMemo(() => groups.flatMap((group) => group.sheets), [groups]);

  // action trả câu thông báo của BE để hiện toast
  const runOnSheet = useCallback(
    async (sheetId: string, action: () => Promise<string>) => {
      setBusySheetId(sheetId);
      try {
        toast.success(await action());
        reload();
      } catch (actionError) {
        toast.error("Không cập nhật được bản nhạc", getErrorMessage(actionError));
      } finally {
        setBusySheetId(null);
      }
    },
    [reload]
  );

  // null = lưu xong; có lỗi thì trả về để form tô đỏ đúng ô
  const saveSheet = useCallback(
    async (
      values: SheetFormValues,
      editing?: LecturerSheetMusic
    ): Promise<FormFailure<keyof SheetFormValues> | null> => {
      try {
        const files: Record<SheetFileSlot, StoredFile | null> = {
          sheet: values.sheetFile ? await uploadForField("sheetFileId", "SHEET", values.sheetFile) : null,
          audio: values.referenceRecording
            ? await uploadForField("referenceAudioId", "AUDIO", values.referenceRecording)
            : null,
          video: values.tutorialVideo ? await uploadForField("tutorialVideoId", "VIDEO", values.tutorialVideo) : null,
        };
        const request: SheetMusicRequest = {
          instrumentId: values.instrumentId,
          kind: values.isMain ? "MAIN" : "LEVEL",
          name: values.name,
          levelId: values.levelId,
          description: values.description || null,
          // Admin đã ẩn thì không gửi để BE giữ nguyên (GBR-45)
          visibility: editing?.canChangeVisibility === false ? undefined : values.visibility,
        };

        if (editing) {
          // Gắn file trước rồi mới đổi thông tin: bản chính phải có bản thu mẫu thì mới công khai được (GBR-43)
          for (const slot of ["sheet", "audio", "video"] as const) {
            const file = files[slot];
            if (file) await lecturerApi.replaceSheetFile(editing.id, slot, file.id);
          }
        }
        const { data: body } = editing
          ? await lecturerApi.updateSheetMusic(editing.id, request)
          : await lecturerApi.createSheetMusic(songId, {
              ...request,
              // Schema đã bắt buộc chọn file bản nhạc khi tạo mới
              sheetFileId: files.sheet?.id ?? "",
              referenceAudioId: files.audio?.id ?? null,
              tutorialVideoId: files.video?.id ?? null,
            });
        toast.success(body.message, values.name);
        reload();
        return null;
      } catch (saveError) {
        return toFormFailure(saveError, SAVE_ERROR, FIELD_MAP);
      }
    },
    [reload, songId]
  );

  const replaceFile = useCallback(
    (sheet: LecturerSheetMusic, slot: SheetFileSlot, file: File) =>
      runOnSheet(sheet.id, async () => {
        const uploaded = await uploadMediaFile(SLOT_KINDS[slot], file);
        const { data: body } = await lecturerApi.replaceSheetFile(sheet.id, slot, uploaded.id);
        return body.message;
      }),
    [runOnSheet]
  );

  const changeVisibility = useCallback(
    (sheet: LecturerSheetMusic, visibility: EditableVisibility) =>
      runOnSheet(sheet.id, async () => {
        const { data: body } = await lecturerApi.setSheetVisibility(sheet.id, visibility);
        return body.message;
      }),
    [runOnSheet]
  );

  return {
    song: data?.piece,
    groups,
    sheets,
    instrumentOptions: data?.list.instrumentOptions ?? [],
    error,
    isFirstLoad,
    isRefreshing: isLoading && !isFirstLoad,
    reload,
    saveSheet,
    replaceFile,
    changeVisibility,
    busySheetId,
  };
}
