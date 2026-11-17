import { studentStatsApi } from "@/features/practice/api/studentStatsApi";
import { parseApiError } from "@/features/classes/utils/mapApiErrors";
import { useApiQuery } from "@/shared/hooks/useApiQuery";

// classId null = để BE chọn lớp mặc định.
export function useMyStats(classId: string | null) {
  const { data, error, isLoading, reload } = useApiQuery(
    `me-stats:${classId ?? "default"}`,
    async () => (await studentStatsApi.getMine(classId ?? undefined)).data.data
  );
  return {
    stats: data,
    isLoading,
    error: error ? parseApiError(error, "Tải thống kê thất bại. Vui lòng thử lại.").message : null,
    reload,
  };
}
