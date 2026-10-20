import { axiosClient } from "@/shared/api/axiosClient";
import { type ApiResponse } from "@/shared/types/commonTypes";
import { type ClassOption, type ProgressParams, type ProgressResult } from "@/features/classes/types/progressTypes";

export const progressApi = {
  listClasses: () => axiosClient.get<ApiResponse<ClassOption[]>>("/classes"),
  getProgress: (classId: string, params: ProgressParams) =>
    axiosClient.get<ApiResponse<ProgressResult>>(`/classes/${classId}/progress`, { params }),
};
