import { practiceContextApi } from "@/features/practice/api/practiceContextApi";
import type { PracticeContext } from "@/features/practice/types/practiceContextTypes";
import { useAsyncData } from "@/shared/hooks/useAsyncData";

// Thông tin bản nhạc và bài tập của lớp cho màn ghi âm; chưa có sheetId thì không gọi BE
export function usePracticeContext(pieceId: string, sheetMusicId: string, assignmentId?: string) {
  const { data, error, isLoading } = useAsyncData<PracticeContext | null>(
    () => (sheetMusicId ? practiceContextApi.get({ pieceId, sheetMusicId, assignmentId }) : Promise.resolve(null)),
    `practice-context:${pieceId}:${sheetMusicId}:${assignmentId ?? ""}`
  );

  return { context: data, error, isLoading };
}
