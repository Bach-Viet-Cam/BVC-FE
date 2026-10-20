import { axiosClient } from "@/shared/api/axiosClient";
import { type ApiResponse, type PaginatedData } from "@/shared/types/commonTypes";
import {
  type UserCreateRequest,
  type UserItem,
  type UserListParams,
  type UserUpdateRequest,
} from "@/features/platform/types/userTypes";
import {
  type StudentImportRequest,
  type StudentImportResult,
} from "@/features/platform/types/userImportTypes";

export const userApi = {
  list: (params: UserListParams) => axiosClient.get<ApiResponse<PaginatedData<UserItem>>>("/users", { params }),
  create: (body: UserCreateRequest) => axiosClient.post<ApiResponse<UserItem>>("/users", body),
  update: (id: string, body: UserUpdateRequest) => axiosClient.patch<ApiResponse<UserItem>>(`/users/${id}`, body),
  lock: (id: string) => axiosClient.post<ApiResponse<UserItem>>(`/users/${id}/lock`),
  unlock: (id: string) => axiosClient.post<ApiResponse<UserItem>>(`/users/${id}/unlock`),
  importStudents: (body: StudentImportRequest) => axiosClient.post<ApiResponse<StudentImportResult>>("/users/import", body),
};
