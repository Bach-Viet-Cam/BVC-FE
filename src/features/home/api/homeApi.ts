import { axiosClient } from "@/shared/api/axiosClient";
import type { ApiResponse } from "@/shared/types/commonTypes";
import type { StudentDashboard } from "@/features/home/types/homeTypes";

export const homeApi = {
  getDashboard: () => axiosClient.get<ApiResponse<StudentDashboard>>("/practice/dashboard", { timeout: 15_000 }),
};
