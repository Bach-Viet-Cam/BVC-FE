import { axiosClient } from "@/shared/api/axiosClient";
import { type ApiResponse } from "@/shared/types/commonTypes";
import {
  type EnsembleAssignmentInfo,
  type EnsembleSessionDetail,
  type EnsembleSubmission,
  type EnsembleTracksResult,
} from "@/features/ensemble/types/ensembleTypes";

export const ensembleApi = {
  getTracks: (pieceId: string, assignmentId?: string) =>
    axiosClient.get<ApiResponse<EnsembleTracksResult>>(`/pieces/${pieceId}/ensemble-tracks`, {
      params: { assignmentId },
    }),
  getAssignment: (assignmentId: string) =>
    axiosClient.get<ApiResponse<EnsembleAssignmentInfo>>(`/assignments/${assignmentId}`),
  uploadRecording: (file: File, onProgress: (percent: number) => void) => {
    const body = new FormData();
    body.append("file", file);
    return axiosClient.post<ApiResponse<{ fileId: string; url: string }>>("/audio-uploads", body, {
      headers: { "Content-Type": undefined },
      timeout: 120_000,
      onUploadProgress: (event) => {
        if (event.total) onProgress(Math.round((event.loaded * 100) / event.total));
      },
    });
  },
  createSubmission: (body: { pieceId: string; sheetMusicId: string; assignmentId?: string; studentUploadId: string }) =>
    axiosClient.post<ApiResponse<EnsembleSubmission>>("/practice/submissions", { ...body, practiceMode: "ENSEMBLE" }, { timeout: 30_000 }),
  getSubmission: (id: string) =>
    axiosClient.get<ApiResponse<EnsembleSubmission>>(`/practice/submissions/${encodeURIComponent(id)}`, { timeout: 15_000 }),
  retrySubmission: (id: string) =>
    axiosClient.post<ApiResponse<EnsembleSubmission>>(`/practice/submissions/${encodeURIComponent(id)}/retry`, null, { timeout: 30_000 }),
  getSession: (sessionId: string) =>
    axiosClient.get<ApiResponse<EnsembleSessionDetail>>(`/ensemble-sessions/${sessionId}`),
};
