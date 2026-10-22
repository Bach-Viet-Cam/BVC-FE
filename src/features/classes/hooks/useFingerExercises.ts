import { roadmapsApi } from "@/features/classes/api/roadmapsApi";
import { useApiQuery } from "@/shared/hooks/useApiQuery";

export function useFingerExercises(instrumentId: string | null, query: string) {
  const { data, error, isLoading } = useApiQuery(
    instrumentId ? JSON.stringify({ instrumentId, query }) : null,
    async () => (await roadmapsApi.listFingerExercises(instrumentId as string, query)).data.data
  );
  return {
    exercises: data ?? [],
    isLoading,
    error: error ? "Tải danh sách bài luyện ngón thất bại. Vui lòng thử lại." : null,
  };
}
