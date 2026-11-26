import { challengeApi } from "@/features/community/api/challengeApi";
import { parseApiError } from "@/features/classes/utils/mapApiErrors";
import { useApiQuery } from "@/shared/hooks/useApiQuery";

// Lecturer drawer: configuration, students and practice stats of one challenge. No id = nothing fetched.
export function useChallengeDetail(challengeId: string | undefined) {
  const { data, error, isLoading, reload } = useApiQuery(
    challengeId ? `challenge-detail:${challengeId}` : null,
    async () => (await challengeApi.getDetail(challengeId as string)).data.data
  );
  return {
    challenge: data,
    isLoading,
    error: error ? parseApiError(error, "Tải dữ liệu thất bại. Vui lòng thử lại.").message : null,
    reload,
  };
}
