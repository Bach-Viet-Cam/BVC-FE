import { axiosClient } from "@/shared/api/axiosClient";
import type { ApiResponse } from "@/shared/types/commonTypes";
import type {
  ClassRank,
  PitchChart,
  PracticeResult,
  ResultHistory,
} from "@/features/practice/types/practiceResultTypes";

const resultPath = (id: string, part: string) => `/practice/submissions/${encodeURIComponent(id)}/${part}`;

export const practiceResultApi = {
  getResult: (id: string, signal?: AbortSignal) =>
    axiosClient.get<ApiResponse<PracticeResult>>(resultPath(id, "result"), { signal, timeout: 15_000 }),
  getHistory: (id: string, signal?: AbortSignal) =>
    axiosClient.get<ApiResponse<ResultHistory>>(resultPath(id, "history"), { signal, timeout: 15_000 }),
  getClassRank: (id: string, signal?: AbortSignal) =>
    axiosClient.get<ApiResponse<ClassRank | null>>(resultPath(id, "class-rank"), { signal, timeout: 15_000 }),
  // Lần đầu BE phải đọc file phân tích từ Rhythm nên cho thời gian chờ dài hơn
  getPitchChart: (id: string, signal?: AbortSignal) =>
    axiosClient.get<ApiResponse<PitchChart>>(resultPath(id, "pitch-chart"), { signal, timeout: 30_000 }),
};
