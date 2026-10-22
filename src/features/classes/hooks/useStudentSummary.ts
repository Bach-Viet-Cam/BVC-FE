import { teacherProgressApi } from "@/features/classes/api/teacherProgressApi";
import { useApiQuery } from "@/features/classes/hooks/useApiQuery";

export function useStudentSummary(classId: string, studentId: string) {
  const { data, error, isLoading, reload } = useApiQuery(
    `summary:${classId}:${studentId}`,
    async () => (await teacherProgressApi.getStudentSummary(classId, studentId)).data.data
  );
  return { summary: data, isLoading, error: error ? "Tải dữ liệu thất bại. Vui lòng thử lại." : null, reload };
}
