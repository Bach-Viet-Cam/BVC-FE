import { challengeApi } from "@/features/community/api/challengeApi";
import { useApiQuery } from "@/shared/hooks/useApiQuery";

export function useChallengePieces(instrumentId: string | null, query: string) {
  const { data, error, isLoading } = useApiQuery(
    instrumentId ? JSON.stringify({ instrumentId, query }) : null,
    async () =>
      (await challengeApi.pieces({ instrumentId: instrumentId as string, q: query || undefined })).data.data.items
  );
  return {
    pieces: data ?? [],
    isLoading,
    error: error ? "Tải danh sách bài nhạc thất bại. Vui lòng thử lại." : null,
  };
}
