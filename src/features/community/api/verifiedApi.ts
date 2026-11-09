import { axiosClient } from "@/shared/api/axiosClient";
import type { ApiResponse } from "@/shared/types/commonTypes";
import type { ReviewState, VerifiedItem, VerifiedList } from "@/features/community/types/verifiedTypes";

export const verifiedApi = {
  list: async (params: Record<string, string | number>) =>
    (await axiosClient.get<ApiResponse<VerifiedList>>("/verified-contents", { params })).data.data,
  library: async (pieceId: string, instrumentId: string, page: number, sourceSheetMusicId?: string) =>
    (
      await axiosClient.get<ApiResponse<VerifiedList>>(`/library/pieces/${pieceId}/verified-recordings`, {
        params: { instrumentId, page, pageSize: 6, sourceSheetMusicId },
      })
    ).data.data,
  mutate: async (item: VerifiedItem, status: "VISIBLE" | "HIDDEN" | "REVOKED", reason?: string) =>
    status === "REVOKED"
      ? (
          await axiosClient.post<ApiResponse<VerifiedItem>>(`/verified-contents/${item.id}/revoke`, {
            version: item.version,
            reason,
          })
        ).data.data
      : (
          await axiosClient.patch<ApiResponse<VerifiedItem>>(`/verified-contents/${item.id}/visibility`, {
            version: item.version,
            status,
            reason,
          })
        ).data.data,
  review: async (id: string) =>
    (await axiosClient.get<ApiResponse<ReviewState>>(`/submissions/${id}/review`)).data.data,
  decide: async (id: string, decision: "APPROVE" | "REJECT", reason?: string, manual = false) =>
    (await axiosClient.post<ApiResponse<ReviewState>>(`/submissions/${id}/review`, { decision, reason, manual })).data
      .data,
  consent: async (id: string, isGranted: boolean) =>
    (await axiosClient.put<ApiResponse<ReviewState>>(`/submissions/${id}/sharing-consent`, { isGranted })).data.data,
};
