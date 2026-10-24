import { practiceContextApi } from "@/features/practice/api/practiceContextApi";
import { PRACTICE_DEFAULTS } from "@/features/practice/constants/practiceConstants";
import type { PracticeTargetBpm } from "@/features/practice/types/practiceContextTypes";
import { useAsyncData } from "@/shared/hooks/useAsyncData";

// Tốc độ luyện của bản nhạc: BPM bài tập của lớp nếu được giao, ngược lại mặc định 60.
// Đang tải, lỗi hoặc chưa có sheetId thì dùng mặc định để màn hình không phải chờ.
export function usePracticeTargetBpm(sheetMusicId: string, assignmentId?: string) {
  const { data, error, isLoading } = useAsyncData<PracticeTargetBpm | null>(
    () => (sheetMusicId ? practiceContextApi.getTargetBpm({ sheetMusicId, assignmentId }) : Promise.resolve(null)),
    `practice-target-bpm:${sheetMusicId}:${assignmentId ?? ""}`
  );

  return {
    targetBpm: data?.targetBpm ?? PRACTICE_DEFAULTS.targetBpm,
    source: data?.source ?? "DEFAULT",
    error,
    isLoading,
  };
}
