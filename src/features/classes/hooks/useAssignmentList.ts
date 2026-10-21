import { assignmentsApi } from "@/features/classes/api/assignmentsApi";
import { useApiQuery } from "@/features/classes/hooks/useApiQuery";
import { type AssignmentListParams } from "@/features/classes/types/teacherAssignmentTypes";

// params null = nothing to list yet (e.g. no class chosen): nothing is fetched.
export function useAssignmentList(params: AssignmentListParams | null) {
  const query = params && { ...params, limit: 100 };
  const { data, error, isLoading, reload } = useApiQuery(query ? JSON.stringify(query) : null, async () =>
    query ? (await assignmentsApi.listAssignments(query)).data.data : null
  );
  return { result: data, isLoading, error: error ? "Tải dữ liệu thất bại. Vui lòng thử lại." : null, reload };
}
