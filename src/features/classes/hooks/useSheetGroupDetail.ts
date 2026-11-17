import { assignmentsApi } from "@/features/classes/api/assignmentsApi";
import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { parseApiError } from "@/features/classes/utils/mapApiErrors";

export function useSheetGroupDetail(sheetMusicId: string | undefined) {
  const { data, error, isLoading, reload } = useApiQuery(
    sheetMusicId ? `sheet-group:${sheetMusicId}` : null,
    async () => (await assignmentsApi.getSheetGroup(sheetMusicId as string)).data.data
  );
  return {
    group: data,
    isLoading,
    error: error ? parseApiError(error, "Tải dữ liệu thất bại. Vui lòng thử lại.").message : null,
    reload,
  };
}
