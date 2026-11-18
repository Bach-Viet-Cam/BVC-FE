import { axiosClient } from "@/shared/api/axiosClient";
import type { ApiResponse } from "@/shared/types/commonTypes";
import type {
  AudioEvaluation,
  AudioEvaluationInput,
  AudioUploadResult,
  AudioUploadSource,
} from "../types/audioAnalysisTypes";

export const audioAnalysisApi = {
  // source: "file" → server cắt cả hai đầu theo cao độ; "recording" (ghi âm trực tiếp) → chỉ cắt cuối
  upload: (
    file: File,
    signal: AbortSignal,
    onProgress: (percent: number) => void,
    source: AudioUploadSource = "file"
  ) => {
    const body = new FormData();
    body.append("source", source);
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
