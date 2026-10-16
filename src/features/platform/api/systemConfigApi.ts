import { axiosClient } from "@/shared/api/axiosClient";
import { type ApiResponse } from "@/shared/types/commonTypes";
import { type SystemConfigItem, type SystemConfigListParams } from "@/features/platform/types/configTypes";

export const systemConfigApi = {
  list: (params: SystemConfigListParams) =>
    axiosClient.get<ApiResponse<SystemConfigItem[]>>("/system-configs", { params }),
  updateValue: (id: string, value: string) =>
    axiosClient.patch<ApiResponse<SystemConfigItem>>(`/system-configs/${id}`, { value }),
};
