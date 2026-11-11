import { useCallback, useRef, useState } from "react";
import { classesApi } from "@/features/classes/api/classesApi";
import { type ClassFileImportPreview, type ClassFileImportResult } from "@/features/classes/types/classTypes";
import { parseApiError } from "@/features/classes/utils/mapApiErrors";

export const ONLY_XLSX_MESSAGE = "Chỉ hỗ trợ file .xlsx.";

export type ClassFileImportPhase = "idle" | "uploading" | "preview" | "confirming";

export function useClassFileImport() {
  const [phase, setPhase] = useState<ClassFileImportPhase>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ClassFileImportPreview | null>(null);

  const requestId = useRef(0);

  const selectFile = useCallback(async (next: File) => {
    const id = ++requestId.current;
    setPreview(null);
    if (!next.name.toLowerCase().endsWith(".xlsx")) {
      setFile(null);
      setFileError(ONLY_XLSX_MESSAGE);
      setPhase("idle");
      return;
    }
    setFile(next);
    setFileError(null);
    setPhase("uploading");
    try {
      const { data } = await classesApi.previewClassFileImport(next);
      if (id !== requestId.current) return; // dialog was reset or another file chosen meanwhile
      setPreview(data.data);
      setPhase("preview");
    } catch (error) {
      if (id !== requestId.current) return;
      setFile(null);
      setFileError(parseApiError(error, "Tải file thất bại. Vui lòng thử lại.").message);
      setPhase("idle");
    }
  }, []);

  const confirm = useCallback(async (): Promise<
    { message: string; result: ClassFileImportResult } | { error: string }
  > => {
    if (!file) return { error: "Vui lòng chọn file." };
    setPhase("confirming");
    try {
      const { data } = await classesApi.confirmClassFileImport(file);
      return { message: data.message, result: data.data };
    } catch (error) {
      setPhase("preview");
      return { error: parseApiError(error, "Tạo lớp thất bại. Vui lòng thử lại.").message };
    }
  }, [file]);

  const reset = useCallback(() => {
    requestId.current += 1;
    setPhase("idle");
    setFile(null);
    setFileError(null);
    setPreview(null);
  }, []);

  const canConfirm = phase === "preview" && !!preview && preview.blockingErrors.length === 0 && preview.validRows > 0;

  return { phase, file, fileError, preview, canConfirm, selectFile, confirm, reset };
}
