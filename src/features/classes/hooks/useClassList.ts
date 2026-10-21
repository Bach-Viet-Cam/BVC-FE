import { classesApi } from "@/features/classes/api/classesApi";
import { useApiQuery } from "@/features/classes/hooks/useApiQuery";
import { type ClassListParams } from "@/features/classes/types/classTypes";

export function useClassList(params: ClassListParams) {
  const query = {
    q: params.q || undefined,
    cohort: params.cohort || undefined,
    instrumentId: params.instrumentId || undefined,
    status: params.status,
    limit: 200,
  };
  const { data, error, isLoading, reload } = useApiQuery(
    JSON.stringify(query),
    async () => (await classesApi.listClasses(query)).data.data
  );
  return { result: data, isLoading, error: error ? "Tải dữ liệu thất bại. Vui lòng thử lại." : null, reload };
}
