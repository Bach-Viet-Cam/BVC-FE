import { progressApi } from "@/features/classes/api/progressApi";
import { useApiQuery } from "@/features/classes/hooks/useApiQuery";

export function useStudentSummary(classId: string, studentId: string) {
  const { data, error, isLoading, reload } = useApiQuery(
    `summary:${classId}:${studentId}`,
    async () => (await progressApi.getStudentSummary(classId, studentId)).data.data
  );
  return { summary: data, isLoading, error: error ? "Tải dữ liệu thất bại. Vui lòng thử lại." : null, reload };
}
