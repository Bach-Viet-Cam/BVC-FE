import { axiosClient } from "@/shared/api/axiosClient";
import type { ApiResponse } from "@/shared/types/commonTypes";
import type {
  PracticeContext,
  PracticeContextQuery,
  PracticeInstrumentTunes,
  PracticeTargetBpm,
} from "@/features/practice/types/practiceContextTypes";

export const practiceContextApi = {
  get: (query: PracticeContextQuery, signal?: AbortSignal) =>
    axiosClient
      .get<ApiResponse<PracticeContext>>("/practice/context", { params: query, signal, timeout: 15_000 })
      .then((response) => response.data.data),
  getTargetBpm: (query: PracticeContextQuery, signal?: AbortSignal) =>
    axiosClient
      .get<ApiResponse<PracticeTargetBpm>>("/practice/target-bpm", { params: query, signal, timeout: 15_000 })
      .then((response) => response.data.data),
  getTunes: (sheetMusicId: string, signal?: AbortSignal) =>
    axiosClient
      .get<ApiResponse<PracticeInstrumentTunes>>(`/practice/sheets/${encodeURIComponent(sheetMusicId)}/tunes`, {
        signal,
        timeout: 15_000,
      })
      .then((response) => response.data.data),
};
