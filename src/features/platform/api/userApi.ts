import { axiosClient } from "@/shared/api/axiosClient";
import { type ApiResponse, type PaginatedData } from "@/shared/types/commonTypes";
import {
  type UserCreateRequest,
  type UserItem,
  type UserListParams,
  type UserUpdateRequest,
} from "@/features/platform/types/userTypes";

export const userApi = {
  list: (params: UserListParams) => axiosClient.get<ApiResponse<PaginatedData<UserItem>>>("/users", { params }),
  create: (body: UserCreateRequest) => axiosClient.post<ApiResponse<UserItem>>("/users", body),
  update: (id: string, body: UserUpdateRequest) => axiosClient.patch<ApiResponse<UserItem>>(`/users/${id}`, body),
  lock: (id: string) => axiosClient.post<ApiResponse<UserItem>>(`/users/${id}/lock`),
  unlock: (id: string) => axiosClient.post<ApiResponse<UserItem>>(`/users/${id}/unlock`),
};
