import { axiosClient } from "@/shared/api/axiosClient";
import type { ApiResponse } from "@/shared/types/commonTypes";
import type { PracticeContext, PracticeContextQuery } from "@/features/practice/types/practiceContextTypes";

export const practiceContextApi = {
  get: (query: PracticeContextQuery, signal?: AbortSignal) =>
    axiosClient
      .get<ApiResponse<PracticeContext>>("/practice/context", { params: query, signal, timeout: 15_000 })
      .then((response) => response.data.data),
};
