import { axiosClient } from "@/shared/api/axiosClient";
import { type ApiResponse } from "@/shared/types/commonTypes";
import { type AdminMonitoring, type AdminOverview } from "@/features/platform/types/adminTypes";

export const adminStatsApi = {
  overview: () => axiosClient.get<ApiResponse<AdminOverview>>("/admin/overview"),
  monitoring: () => axiosClient.get<ApiResponse<AdminMonitoring>>("/admin/monitoring"),
};
