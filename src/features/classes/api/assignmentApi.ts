import { axiosClient } from "@/shared/api/axiosClient";
import { type ApiResponse } from "@/shared/types/commonTypes";
import {
  type AssignmentDetail,
  type AssignmentListItem,
  type MyAssignmentsParams,
} from "@/features/classes/types/assignmentTypes";

export const assignmentApi = {
  listMine: (params: MyAssignmentsParams) =>
    axiosClient.get<ApiResponse<AssignmentListItem[]>>("/me/assignments", { params }),
  get: (id: string) => axiosClient.get<ApiResponse<AssignmentDetail>>(`/assignments/${id}`),
};
