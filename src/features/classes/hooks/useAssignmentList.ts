import { assignmentsApi } from "@/features/classes/api/assignmentsApi";
import { useApiQuery } from "@/features/classes/hooks/useApiQuery";
import { type AssignmentListParams } from "@/features/classes/types/teacherAssignmentTypes";

export function useAssignmentList(params: AssignmentListParams) {
  const query = { ...params, limit: 100 };
  const { data, error, isLoading, reload } = useApiQuery(
    JSON.stringify(query),
    async () => (await assignmentsApi.listAssignments(query)).data.data
  );
  return { result: data, isLoading, error: error ? "Tải dữ liệu thất bại. Vui lòng thử lại." : null, reload };
}
