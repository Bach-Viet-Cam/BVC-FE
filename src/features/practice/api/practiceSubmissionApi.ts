import { axiosClient } from "@/shared/api/axiosClient";
import type { ApiResponse } from "@/shared/types/commonTypes";
import type {
  CreatePracticeSubmissionInput,
  PracticeSubmission,
} from "@/features/practice/types/practiceSubmissionTypes";

export const practiceSubmissionApi = {
  create: (body: CreatePracticeSubmissionInput, signal?: AbortSignal) =>
    axiosClient.post<ApiResponse<PracticeSubmission>>("/practice/submissions", body, { signal, timeout: 30_000 }),
  get: (id: string, signal?: AbortSignal) =>
    axiosClient.get<ApiResponse<PracticeSubmission>>(`/practice/submissions/${encodeURIComponent(id)}`, {
      signal,
      timeout: 15_000,
    }),
  getActive: (sheetMusicId: string, signal?: AbortSignal) =>
    axiosClient.get<ApiResponse<PracticeSubmission | null>>("/practice/submissions/active", {
      params: { sheetMusicId },
      signal,
      timeout: 15_000,
    }),
  retry: (id: string) =>
    axiosClient.post<ApiResponse<PracticeSubmission>>(`/practice/submissions/${encodeURIComponent(id)}/retry`, null, {
      timeout: 30_000,
    }),
};
