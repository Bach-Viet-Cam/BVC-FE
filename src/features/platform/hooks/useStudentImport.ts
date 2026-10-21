import { useCallback, useState } from "react";
import { userApi } from "@/features/platform/api/userApi";
import {
  type StudentImportMode,
  type StudentImportResult,
  type StudentImportRow,
} from "@/features/platform/types/userImportTypes";
import { readStudentExcel } from "@/features/platform/utils/studentExcelReader";
import { toast } from "@/shared/components/ui/toast";
import { getApiErrorMessage } from "@/shared/utils/getApiErrorMessage";

export type StudentImportPhase = "select" | "preview" | "done";

const ANALYZE_ERROR = "Không thể kiểm tra dữ liệu. Vui lòng thử lại.";
const COMMIT_ERROR = "Không thể import. Vui lòng thử lại.";

export function useStudentImport(onImported: () => void) {
  const [phase, setPhase] = useState<StudentImportPhase>("select");
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<StudentImportRow[]>([]);
  const [mode, setMode] = useState<StudentImportMode>("skip");
  const [analysis, setAnalysis] = useState<StudentImportResult | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(async (nextRows: StudentImportRow[], nextMode: StudentImportMode, dryRun: boolean) => {
    const { data } = await userApi.importStudents({ rows: nextRows, mode: nextMode, dryRun });
    return data;
  }, []);

  const selectFile = useCallback(
    async (file: File): Promise<void> => {
      setError(null);
      setIsBusy(true);
      await new Promise((resolve) => setTimeout(resolve, 0));
      try {
        const parsed = await readStudentExcel(file);
        if (parsed.error) {
          setError(parsed.error);
          return;
        }
        const response = await send(parsed.rows, mode, true);
        setFileName(file.name);
        setRows(parsed.rows);
        setAnalysis(response.data);
        setPhase("preview");
      } catch (selectError: unknown) {
        setError(getApiErrorMessage(selectError, ANALYZE_ERROR));
      } finally {
        setIsBusy(false);
      }
    },
    [mode, send]
  );

  const changeMode = useCallback(
    async (nextMode: StudentImportMode): Promise<void> => {
      setError(null);
      setIsBusy(true);
      try {
        const response = await send(rows, nextMode, true);
        setMode(nextMode);
        setAnalysis(response.data);
      } catch (modeError: unknown) {
        setError(getApiErrorMessage(modeError, ANALYZE_ERROR));
      } finally {
        setIsBusy(false);
      }
    },
    [rows, send]
  );

  const confirm = useCallback(async (): Promise<void> => {
    setError(null);
    setIsBusy(true);
    try {
      const response = await send(rows, mode, false);
      setAnalysis(response.data);
      setPhase("done");
      toast.success(response.message);
      onImported();
    } catch (commitError: unknown) {
      const message = getApiErrorMessage(commitError, COMMIT_ERROR);
      toast.error(message);
      setError(message);
      try {
        setAnalysis((await send(rows, mode, true)).data);
      } catch {
        /* giữ nguyên bản xem trước cũ; thông báo lỗi đã hiện */
      }
    } finally {
      setIsBusy(false);
    }
  }, [mode, onImported, rows, send]);

  const reset = useCallback(() => {
    setPhase("select");
    setFileName("");
    setRows([]);
    setAnalysis(null);
    setError(null);
  }, []);

  return { phase, fileName, mode, analysis, isBusy, error, selectFile, changeMode, confirm, reset };
}
