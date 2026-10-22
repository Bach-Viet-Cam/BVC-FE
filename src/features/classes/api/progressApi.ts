import { axiosClient } from "@/shared/api/axiosClient";
import { type ApiResponse } from "@/shared/types/commonTypes";
import { type ClassOption, type ProgressParams, type ProgressResult } from "@/features/classes/types/progressTypes";

export const progressApi = {
  // Short { id, name } list for the class picker; GET /classes is the paginated class list.
  listClasses: () => axiosClient.get<ApiResponse<ClassOption[]>>("/classes/owned"),
  getProgress: (classId: string, params: ProgressParams) =>
    axiosClient.get<ApiResponse<ProgressResult>>(`/classes/${classId}/progress`, { params }),
};
