import { useCallback, useEffect, useRef, useState } from "react";
import { classesApi } from "@/features/classes/api/classesApi";
import { type ImportPreview } from "@/features/classes/types/classTypes";
import { parseApiError } from "@/features/classes/utils/mapApiErrors";

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ["xlsx", "csv"];
export const UNSUPPORTED_FILE_MESSAGE =
  "Định dạng file không được hỗ trợ. Vui lòng chọn file có định dạng .xlsx, .csv.";
export const FILE_TOO_LARGE_MESSAGE = "File vượt quá dung lượng tối đa 2 MB.";
export const NO_VALID_ROW_MESSAGE = "Không thể nhập danh sách vì không có dòng hợp lệ.";

export type ImportPhase = "select" | "uploading" | "preview" | "confirming";

// Quick client-side checks; the server repeats every check (format, size, columns, rows).
export function checkImportFile(file: File): string | null {
  const extension = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() : "";
  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) return UNSUPPORTED_FILE_MESSAGE;
  if (file.size > MAX_FILE_BYTES) return FILE_TOO_LARGE_MESSAGE;
  return null;
}

export function useImportStudents(classId: string) {
  const [phase, setPhase] = useState<ImportPhase>("select");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const openLogIdRef = useRef<string | null>(null);

  const cancelOpenPreview = useCallback(() => {
    const logId = openLogIdRef.current;
    openLogIdRef.current = null;
    // The Student Import Log becomes Cancelled when the lecturer leaves without confirming.
    if (logId) void classesApi.cancelImport(classId, logId).catch(() => undefined);
  }, [classId]);

  useEffect(() => cancelOpenPreview, [cancelOpenPreview]);

  const selectFile = useCallback(
    async (file: File) => {
      cancelOpenPreview();
      setPreview(null);
      setFileName(file.name);
      const localError = checkImportFile(file);
      if (localError) {
        setFileError(localError);
        setPhase("select");
        return;
      }
      setFileError(null);
      setPhase("uploading");
      try {
        const { data } = await classesApi.previewImport(classId, file);
        openLogIdRef.current = data.data.logId;
        setPreview(data.data);
        setPhase("preview");
      } catch (error) {
        setFileError(parseApiError(error, "Tải file thất bại. Vui lòng thử lại.").message);
        setPhase("select");
      }
    },
    [classId, cancelOpenPreview]
  );

  const confirm = useCallback(async (): Promise<{ message: string } | { error: string }> => {
    if (!preview) return { error: NO_VALID_ROW_MESSAGE };
    setPhase("confirming");
    try {
      const { data } = await classesApi.confirmImport(classId, preview.logId);
      openLogIdRef.current = null;
      return { message: data.message };
    } catch (error) {
      setPhase("preview");
      return { error: parseApiError(error, "Nhập danh sách thất bại. Vui lòng thử lại.").message };
    }
  }, [classId, preview]);

  const downloadTemplate = useCallback(async (): Promise<string | null> => {
    try {
      const { data } = await classesApi.downloadImportTemplate();
      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = "mau-danh-sach-sinh-vien.xlsx";
      link.click();
      URL.revokeObjectURL(url);
      return null;
    } catch {
      return "Tải file mẫu thất bại. Vui lòng thử lại.";
    }
  }, []);

  return { phase, fileName, fileError, preview, selectFile, confirm, cancel: cancelOpenPreview, downloadTemplate };
}
