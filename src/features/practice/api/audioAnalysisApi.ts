import { axiosClient } from "@/shared/api/axiosClient";
import type { ApiResponse } from "@/shared/types/commonTypes";
import type { AudioEvaluation, AudioEvaluationInput, AudioUploadResult } from "../types/audioAnalysisTypes";

export const audioAnalysisApi = {
  upload: (file: File, signal: AbortSignal, onProgress: (percent: number) => void) => {
    const body = new FormData();
    body.append("file", file);
    return axiosClient.post<ApiResponse<AudioUploadResult>>("/audio-uploads", body, {
      headers: { "Content-Type": undefined },
      signal,
      timeout: 120_000,
      onUploadProgress: (event) => {
        if (event.total) onProgress(Math.round((event.loaded * 100) / event.total));
      },
    });
  },
  create: (body: AudioEvaluationInput, signal: AbortSignal) =>
    axiosClient.post<ApiResponse<AudioEvaluation>>("/audio-evaluations", body, { signal, timeout: 30_000 }),
  get: (id: string, signal: AbortSignal) =>
    axiosClient.get<ApiResponse<AudioEvaluation>>(`/audio-evaluations/${encodeURIComponent(id)}`, {
      signal,
      timeout: 15_000,
    }),
};
