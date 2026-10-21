import { adminStatsApi } from "@/features/platform/api/adminStatsApi";
import { type AdminMonitoring } from "@/features/platform/types/adminTypes";
import { useAsyncData } from "@/shared/hooks/useAsyncData";

const LOAD_ERROR = "Tải dữ liệu giám sát thất bại. Vui lòng thử lại.";

export function useAdminMonitoring() {
  const { data, error, isLoading, reload } = useAsyncData<AdminMonitoring>(
    () => adminStatsApi.monitoring().then(({ data: body }) => body.data),
    "admin-monitoring",
    LOAD_ERROR
  );
  return { monitoring: data, error, isLoading, reload };
}
