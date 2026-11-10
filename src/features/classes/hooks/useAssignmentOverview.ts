import { assignmentsApi } from "@/features/classes/api/assignmentsApi";
import { useApiQuery } from "@/shared/hooks/useApiQuery";

// Current-semester classes with their assignments: the single data source of the lecturer assignment page.
export function useAssignmentOverview() {
  const { data, error, isLoading, reload } = useApiQuery(
    "assignment-overview",
    async () => (await assignmentsApi.getOverview()).data.data
  );
  return { overview: data, isLoading, error: error ? "Tải dữ liệu thất bại. Vui lòng thử lại." : null, reload };
}
