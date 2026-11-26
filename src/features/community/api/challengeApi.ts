import { axiosClient } from "@/shared/api/axiosClient";
import { type StudentSubmissions } from "@/features/classes/types/teacherAssignmentTypes";
import { type ApiResponse } from "@/shared/types/commonTypes";
import {
  type Challenge,
  type ChallengeDetail,
  type ChallengeFormMeta,
  type ChallengeListParams,
  type ChallengeListResult,
  type ChallengePieceListResult,
  type ChallengePieceParams,
  type StudentChallenge,
  type StudentChallengeListResult,
  type CreateChallengePayload,
  type UpdateChallengePayload,
} from "@/features/community/types/challenge";

const BASE_PATH = "/lecturer/challenges";

export const challengeApi = {
  listForStudent: (params: ChallengeListParams) =>
    axiosClient.get<ApiResponse<StudentChallengeListResult>>("/student/challenges", { params }),
  getForStudent: (challengeId: string) =>
    axiosClient.get<ApiResponse<StudentChallenge>>(`/student/challenges/${encodeURIComponent(challengeId)}`),
  list: (params: ChallengeListParams) => axiosClient.get<ApiResponse<ChallengeListResult>>(BASE_PATH, { params }),
  get: (challengeId: string) => axiosClient.get<ApiResponse<Challenge>>(`${BASE_PATH}/${challengeId}`),
  getDetail: (challengeId: string) =>
    axiosClient.get<ApiResponse<ChallengeDetail>>(`${BASE_PATH}/${challengeId}/detail`),
  getStudentSubmissions: (challengeId: string, studentId: string) =>
    axiosClient.get<ApiResponse<StudentSubmissions>>(`${BASE_PATH}/${challengeId}/students/${studentId}/submissions`),
  create: (payload: CreateChallengePayload) => axiosClient.post<ApiResponse<Challenge>>(BASE_PATH, payload),
  update: (challengeId: string, payload: UpdateChallengePayload) =>
    axiosClient.patch<ApiResponse<Challenge>>(`${BASE_PATH}/${challengeId}`, payload),
  remove: (challengeId: string) => axiosClient.delete<ApiResponse<null>>(`${BASE_PATH}/${challengeId}`),
  publish: (challengeId: string) => axiosClient.post<ApiResponse<Challenge>>(`${BASE_PATH}/${challengeId}/publish`),
  formMeta: () => axiosClient.get<ApiResponse<ChallengeFormMeta>>(`${BASE_PATH}/form-meta`),
  pieces: (params: ChallengePieceParams) =>
    axiosClient.get<ApiResponse<ChallengePieceListResult>>(`${BASE_PATH}/pieces`, { params }),
};
