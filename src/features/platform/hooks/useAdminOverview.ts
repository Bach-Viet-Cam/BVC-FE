import { adminStatsApi } from "@/features/platform/api/adminStatsApi";
import { type AdminOverview } from "@/features/platform/types/adminTypes";
import { useAsyncData } from "@/shared/hooks/useAsyncData";

const LOAD_ERROR = "Tải dữ liệu tổng quan thất bại. Vui lòng thử lại.";

export function useAdminOverview() {
  const { data, error, isLoading, reload } = useAsyncData<AdminOverview>(
    () => adminStatsApi.overview().then(({ data: body }) => body.data),
    "admin-overview",
    LOAD_ERROR
  );
  return { overview: data, error, isLoading, reload };
}
