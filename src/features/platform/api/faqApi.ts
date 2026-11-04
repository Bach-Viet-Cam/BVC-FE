import { axiosClient } from "@/shared/api/axiosClient";
import type { ApiResponse } from "@/shared/types/commonTypes";
import type { FaqInput, FaqItem, FaqList } from "@/features/platform/types/faqTypes";

export const faqApi = {
  list: async (params: Record<string, string | number>, admin = false) =>
    (await axiosClient.get<ApiResponse<FaqList>>(admin ? "/admin/faqs" : "/faqs", { params })).data.data,
  save: async (id: string | null, body: FaqInput) =>
    id
      ? (await axiosClient.patch<ApiResponse<FaqItem>>(`/admin/faqs/${id}`, body)).data.data
      : (await axiosClient.post<ApiResponse<FaqItem>>("/admin/faqs", body)).data.data,
  setActive: (id: string, isActive: boolean) => axiosClient.patch(`/admin/faqs/${id}`, { isActive }),
  remove: (id: string) => axiosClient.delete(`/admin/faqs/${id}`),
};
