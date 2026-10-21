import { axiosClient } from "@/shared/api/axiosClient";
import { type ApiResponse } from "@/shared/types/commonTypes";
import { type GradingSettings, type GradingSettingsPayload } from "@/features/platform/types/settingsTypes";

// TODO(M06): only the grading thresholds used by M03 for now.
export const settingsApi = {
  getGradingSettings: () => axiosClient.get<ApiResponse<GradingSettings>>("/admin/settings/grading"),
  updateGradingSettings: (payload: GradingSettingsPayload) =>
    axiosClient.put<ApiResponse<GradingSettings>>("/admin/settings/grading", payload),
};
