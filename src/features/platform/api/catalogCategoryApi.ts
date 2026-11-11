import { axiosClient } from "@/shared/api/axiosClient";
import { type ApiResponse } from "@/shared/types/commonTypes";
import {
  type CatalogCategoryCreateBody,
  type CatalogCategoryItem,
  type CatalogCategoryListParams,
  type CatalogCategoryListResult,
  type CatalogCategoryUpdateBody,
} from "@/features/platform/types/catalogCategoryTypes";

export const catalogCategoryApi = {
  list: (params: CatalogCategoryListParams) =>
    axiosClient.get<ApiResponse<CatalogCategoryListResult>>("/categories", { params }),
  create: (body: CatalogCategoryCreateBody) => axiosClient.post<ApiResponse<CatalogCategoryItem>>("/categories", body),
  update: (id: string, body: CatalogCategoryUpdateBody) =>
    axiosClient.patch<ApiResponse<CatalogCategoryItem>>(`/categories/${id}`, body),
  activate: (id: string) => axiosClient.post<ApiResponse<CatalogCategoryItem>>(`/categories/${id}/activate`),
  deactivate: (id: string) => axiosClient.post<ApiResponse<CatalogCategoryItem>>(`/categories/${id}/deactivate`),
  remove: (id: string) => axiosClient.delete<ApiResponse<{ id: string }>>(`/categories/${id}`),
};
