import { roadmapsApi } from "@/features/classes/api/roadmapsApi";
import { useApiQuery } from "@/shared/hooks/useApiQuery";

export function useAdminRoadmapList() {
  const { data, error, isLoading, reload } = useApiQuery(
    "admin-roadmaps",
    async () => (await roadmapsApi.listAdminRoadmaps()).data.data
  );
  return { items: data ?? [], isLoading, error: error ? "Tải dữ liệu thất bại. Vui lòng thử lại." : null, reload };
}
