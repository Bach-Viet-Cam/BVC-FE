import { assignmentsApi } from "@/features/classes/api/assignmentsApi";
import { useApiQuery } from "@/features/classes/hooks/useApiQuery";
import { parseApiError } from "@/features/classes/utils/mapApiErrors";

export function useAssignmentDetail(assignmentId: string | undefined) {
  const { data, error, isLoading, reload } = useApiQuery(
    assignmentId ? `assignment:${assignmentId}` : null,
    async () => (await assignmentsApi.getAssignment(assignmentId as string)).data.data
  );
  return {
    assignment: data,
    isLoading,
    error: error ? parseApiError(error, "Tải dữ liệu thất bại. Vui lòng thử lại.").message : null,
    reload,
  };
}
