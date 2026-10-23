import { axiosClient } from "@/shared/api/axiosClient";
import { type ApiResponse } from "@/shared/types/commonTypes";
import {
  type EnsembleAssignmentInfo,
  type EnsembleSessionResult,
  type EnsembleTracksResult,
} from "@/features/ensemble/types/ensembleTypes";

export const ensembleApi = {
  getTracks: (pieceId: string, assignmentId?: string) =>
    axiosClient.get<ApiResponse<EnsembleTracksResult>>(`/pieces/${pieceId}/ensemble-tracks`, {
      params: { assignmentId },
    }),
  getAssignment: (assignmentId: string) =>
    axiosClient.get<ApiResponse<EnsembleAssignmentInfo>>(`/assignments/${assignmentId}`),
  createSession: (form: FormData) =>
    axiosClient.post<ApiResponse<EnsembleSessionResult>>("/ensemble-sessions", form, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    }),
};
