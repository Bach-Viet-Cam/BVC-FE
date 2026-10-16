import { assignmentsApi } from "@/features/classes/api/assignmentsApi";
import { useApiQuery } from "@/features/classes/hooks/useApiQuery";
import { parseApiError } from "@/features/classes/utils/mapApiErrors";

export function useStudentSubmissions(assignmentId: string, studentId: string) {
  const { data, error, isLoading, reload } = useApiQuery(
    `submissions:${assignmentId}:${studentId}`,
    async () => (await assignmentsApi.getStudentSubmissions(assignmentId, studentId)).data.data
  );
  return {
    result: data,
    isLoading,
    error: error ? parseApiError(error, "Tải dữ liệu thất bại. Vui lòng thử lại.").message : null,
    reload,
  };
}
