import { axiosClient } from "@/shared/api/axiosClient";
import type { ApiResponse } from "@/shared/types/commonTypes";
import type { LlmKeyCreateInput, LlmKeyItem, LlmKeyUpdateInput } from "@/features/platform/types/llmKeyTypes";

export const llmKeyApi = {
  list: async () => (await axiosClient.get<ApiResponse<{ items: LlmKeyItem[] }>>("/admin/llm-keys")).data.data.items,
  create: async (body: LlmKeyCreateInput) =>
    (await axiosClient.post<ApiResponse<LlmKeyItem>>("/admin/llm-keys", body)).data.data,
  update: async (id: string, body: LlmKeyUpdateInput) =>
    (await axiosClient.patch<ApiResponse<LlmKeyItem>>(`/admin/llm-keys/${id}`, body)).data.data,
  remove: async (id: string) => {
    await axiosClient.delete(`/admin/llm-keys/${id}`);
  },
};
