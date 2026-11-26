import { challengeApi } from "@/features/community/api/challengeApi";
import { parseApiError } from "@/features/classes/utils/mapApiErrors";
import { useApiQuery } from "@/shared/hooks/useApiQuery";

// One student's submissions counted toward a challenge, newest first.
export function useChallengeStudentSubmissions(challengeId: string, studentId: string) {
  const { data, error, isLoading, reload } = useApiQuery(
    challengeId && studentId ? `challenge-submissions:${challengeId}:${studentId}` : null,
    async () => (await challengeApi.getStudentSubmissions(challengeId, studentId)).data.data
  );
  return {
    result: data,
    isLoading,
    error: error ? parseApiError(error, "Tải dữ liệu thất bại. Vui lòng thử lại.").message : null,
    reload,
  };
}
