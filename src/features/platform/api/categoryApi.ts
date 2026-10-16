import { axiosClient } from "@/shared/api/axiosClient";
import { type ApiResponse } from "@/shared/types/commonTypes";
import { type ContentCategoryItem, type ContentCategoryNode } from "@/features/platform/types/categoryTypes";

export const categoryApi = {
  list: () => axiosClient.get<ApiResponse<ContentCategoryNode[]>>("/content-categories"),
  create: (body: { name: string; parentId?: string | null }) =>
    axiosClient.post<ApiResponse<ContentCategoryItem>>("/content-categories", body),
  rename: (id: string, body: { name: string }) =>
    axiosClient.patch<ApiResponse<ContentCategoryItem>>(`/content-categories/${id}`, body),
  remove: (id: string) => axiosClient.delete<ApiResponse<{ id: string }>>(`/content-categories/${id}`),
};
