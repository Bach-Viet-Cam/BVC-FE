import { roadmapsApi } from "@/features/classes/api/roadmapsApi";
import { useApiQuery } from "@/features/classes/hooks/useApiQuery";

export function useAdminRoadmap(instrumentId: string | null) {
  const { data, error, isLoading, reload } = useApiQuery(
    instrumentId,
    async () => (await roadmapsApi.getAdminRoadmap(instrumentId as string)).data.data
  );
  return { roadmap: data, isLoading, error: error ? "Tải dữ liệu thất bại. Vui lòng thử lại." : null, reload };
}
