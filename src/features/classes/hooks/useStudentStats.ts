import { studentStatsApi } from "@/features/practice/api/studentStatsApi";
import { parseApiError } from "@/features/classes/utils/mapApiErrors";
import { useApiQuery } from "@/shared/hooks/useApiQuery";

export function useStudentStats(classId: string, studentId: string) {
  const { data, error, isLoading, reload } = useApiQuery(
    classId && studentId ? `student-stats:${classId}:${studentId}` : null,
    async () => (await studentStatsApi.getForLecturer(classId, studentId)).data.data
  );
  return {
    stats: data,
    isLoading,
    error: error ? parseApiError(error, "Tải dữ liệu thất bại. Vui lòng thử lại.").message : null,
    reload,
  };
}
