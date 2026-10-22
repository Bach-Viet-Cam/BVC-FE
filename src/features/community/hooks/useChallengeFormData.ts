import { challengeApi } from "@/features/community/api/challengeApi";
import { parseApiError } from "@/features/classes/utils/mapApiErrors";
import { useApiQuery } from "@/shared/hooks/useApiQuery";

// Form defaults plus, in edit mode, the stored draft.
export function useChallengeFormData(challengeId: string | undefined) {
  const meta = useApiQuery("challenge-form-meta", async () => (await challengeApi.formMeta()).data.data);
  const challenge = useApiQuery(
    challengeId ? `challenge:${challengeId}` : null,
    async () => (await challengeApi.get(challengeId as string)).data.data
  );
  const failure = challenge.error ?? meta.error;
  return {
    meta: meta.data,
    challenge: challenge.data,
    isLoading: meta.isLoading || challenge.isLoading,
    error: failure ? parseApiError(failure, "Tải dữ liệu thất bại. Vui lòng thử lại.").message : null,
    reload: () => {
      meta.reload();
      if (challengeId) challenge.reload();
    },
  };
}
