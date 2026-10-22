import { assignmentsApi } from "@/features/classes/api/assignmentsApi";
import { useApiQuery } from "@/features/classes/hooks/useApiQuery";
import { parseApiError } from "@/features/classes/utils/mapApiErrors";

// Either id null = nothing chosen yet: nothing is fetched.
export function useStudentSubmissions(assignmentId: string | null, studentId: string | null) {
  const { data, error, isLoading, reload } = useApiQuery(
    assignmentId && studentId ? `submissions:${assignmentId}:${studentId}` : null,
    async () =>
      assignmentId && studentId ? (await assignmentsApi.getStudentSubmissions(assignmentId, studentId)).data.data : null
  );
  return {
    result: data,
    isLoading,
    error: error ? parseApiError(error, "Tải dữ liệu thất bại. Vui lòng thử lại.").message : null,
    reload,
  };
}
