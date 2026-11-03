import { axiosClient } from "@/shared/api/axiosClient";
import type { ApiResponse } from "@/shared/types/commonTypes";
import type { PitchChart } from "@/features/practice/types/practiceResultTypes";
import type { CreateSegmentInput, SegmentAttempt, SegmentPage } from "@/features/practice/types/practiceSegmentTypes";

const submissionPath = (submissionId: string) => `/practice/submissions/${encodeURIComponent(submissionId)}/segments`;

export const practiceSegmentApi = {
  create: (submissionId: string, body: CreateSegmentInput, signal?: AbortSignal) =>
    axiosClient.post<ApiResponse<SegmentAttempt>>(submissionPath(submissionId), body, { signal, timeout: 30_000 }),
  get: (segmentId: string, signal?: AbortSignal) =>
    axiosClient.get<ApiResponse<SegmentAttempt>>(`/practice/segments/${encodeURIComponent(segmentId)}`, {
      signal,
      timeout: 15_000,
    }),
  // Biểu đồ chỉ gồm đoạn đã luyện; thời gian tính từ đầu đoạn
  getPitchChart: (segmentId: string, signal?: AbortSignal) =>
    axiosClient.get<ApiResponse<PitchChart>>(`/practice/segments/${encodeURIComponent(segmentId)}/pitch-chart`, {
      signal,
      timeout: 30_000,
    }),
  listBySubmission: (submissionId: string, params: { cursor?: string; limit?: number }, signal?: AbortSignal) =>
    axiosClient.get<ApiResponse<SegmentPage>>(submissionPath(submissionId), { params, signal, timeout: 15_000 }),
};
