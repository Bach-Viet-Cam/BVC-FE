import { axiosClient } from "@/shared/api/axiosClient";
import { type ApiResponse } from "@/shared/types/commonTypes";
import {
  type Challenge,
  type ChallengeFormMeta,
  type ChallengeListParams,
  type ChallengeListResult,
  type ChallengePieceListResult,
  type ChallengePieceParams,
  type CreateChallengePayload,
  type UpdateChallengePayload,
} from "@/features/community/types/challenge";

const BASE_PATH = "/lecturer/challenges";

export const challengeApi = {
  list: (params: ChallengeListParams) => axiosClient.get<ApiResponse<ChallengeListResult>>(BASE_PATH, { params }),
  get: (challengeId: string) => axiosClient.get<ApiResponse<Challenge>>(`${BASE_PATH}/${challengeId}`),
  create: (payload: CreateChallengePayload) => axiosClient.post<ApiResponse<Challenge>>(BASE_PATH, payload),
  update: (challengeId: string, payload: UpdateChallengePayload) =>
    axiosClient.patch<ApiResponse<Challenge>>(`${BASE_PATH}/${challengeId}`, payload),
  remove: (challengeId: string) => axiosClient.delete<ApiResponse<null>>(`${BASE_PATH}/${challengeId}`),
  publish: (challengeId: string) => axiosClient.post<ApiResponse<Challenge>>(`${BASE_PATH}/${challengeId}/publish`),
  formMeta: () => axiosClient.get<ApiResponse<ChallengeFormMeta>>(`${BASE_PATH}/form-meta`),
  pieces: (params: ChallengePieceParams) =>
    axiosClient.get<ApiResponse<ChallengePieceListResult>>(`${BASE_PATH}/pieces`, { params }),
};
