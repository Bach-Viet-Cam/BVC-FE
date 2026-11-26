import { challengeApi } from "@/features/community/api/challengeApi";
import { parseApiError } from "@/features/classes/utils/mapApiErrors";
import { useApiQuery } from "@/shared/hooks/useApiQuery";

export function useStudentChallenge(challengeId: string | undefined) {
  const { data, error, isLoading } = useApiQuery(
    challengeId ? `student-challenge:${challengeId}` : null,
    async () => (await challengeApi.getForStudent(challengeId as string)).data.data
  );
  return {
    challenge: data,
    isLoading,
    error: error ? parseApiError(error, "Tải dữ liệu thất bại. Vui lòng thử lại.").message : null,
  };
}

export function useStudentChallengeSubmissions(challengeId: string | undefined) {
  const { data } = useApiQuery(
    challengeId ? `student-challenge-submissions:${challengeId}` : null,
    async () => (await challengeApi.listStudentSubmissions(challengeId as string)).data.data
  );
  return data ?? [];
}
