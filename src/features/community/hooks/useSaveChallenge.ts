import { useState } from "react";
import { challengeApi } from "@/features/community/api/challengeApi";
import { type Challenge } from "@/features/community/types/challenge";
import { type ParsedApiError, parseApiError } from "@/features/classes/utils/mapApiErrors";
import {
  toChallengePayload,
  toCreatePayload,
  type ChallengeFormValues,
} from "@/features/community/utils/validateChallenge";

type SaveResult = { challenge: Challenge; message: string } | { error: ParsedApiError };

export const PUBLISH_SUCCESS_MESSAGE = "Đăng thử thách thành công.";
export const DRAFT_SUCCESS_MESSAGE = "Lưu nháp thử thách thành công.";

// Create: one POST (publish flag). Edit: PATCH the draft, then publish it when asked.
export function useSaveChallenge(challengeId: string | undefined) {
  const [isSaving, setIsSaving] = useState(false);

  const saveChallenge = async (values: ChallengeFormValues, publish: boolean): Promise<SaveResult> => {
    setIsSaving(true);
    try {
      let challenge: Challenge;
      if (challengeId) {
        challenge = (await challengeApi.update(challengeId, toChallengePayload(values))).data.data;
        if (publish) challenge = (await challengeApi.publish(challengeId)).data.data;
      } else {
        challenge = (await challengeApi.create(toCreatePayload(values, publish))).data.data;
      }
      return { challenge, message: publish ? PUBLISH_SUCCESS_MESSAGE : DRAFT_SUCCESS_MESSAGE };
    } catch (error) {
      return { error: parseApiError(error, "Lưu thử thách thất bại. Vui lòng thử lại.") };
    } finally {
      setIsSaving(false);
    }
  };

  return { saveChallenge, isSaving };
}
