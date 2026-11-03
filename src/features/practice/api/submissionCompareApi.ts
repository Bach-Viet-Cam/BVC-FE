import { axiosClient } from "@/shared/api/axiosClient";
import type { ApiResponse } from "@/shared/types/commonTypes";
import type { SubmissionCompare } from "@/features/practice/types/submissionHistoryTypes";

export const submissionCompareApi = {
  // Lần đầu BE có thể phải dựng biểu đồ cao độ của hai bài từ file phân tích nên cho thời gian chờ dài hơn
  get: (a: string, b: string, signal?: AbortSignal) =>
    axiosClient.get<ApiResponse<SubmissionCompare>>("/practice/submissions/compare", {
      params: { a, b },
      signal,
      timeout: 30_000,
    }),
};
