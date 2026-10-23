import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { practiceSubmissionApi } from "@/features/practice/api/practiceSubmissionApi";
import {
  MSG,
  PROGRESS_POLL_MAX_MS,
  PROGRESS_POLL_MS,
} from "@/features/practice/constants/practiceConstants";
import type { PracticeSubmission } from "@/features/practice/types/practiceSubmissionTypes";
import { isFinalStatus } from "@/features/practice/utils/submissionStatus";
import { toast } from "@/shared/components/ui/toast";
import { getApiErrorMessage } from "@/shared/utils/getApiErrorMessage";

// Theo dõi tiến trình xử lý của một bản nộp (GBR-64): hỏi BE định kỳ tới khi có trạng thái cuối
export function useSubmissionProgress(submissionId: string) {
  const [submission, setSubmission] = useState<PracticeSubmission | null>(null);
  const [error, setError] = useState("");
  const [paused, setPaused] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (!submissionId) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let delay = PROGRESS_POLL_MS;
    let failures = 0;

    const schedule = () => {
      timer = setTimeout(() => void poll(), delay);
    };

    const poll = async () => {
      try {
        const response = await practiceSubmissionApi.get(submissionId, controller.signal);
        if (controller.signal.aborted) return;
        const record = response.data.data;
        setSubmission(record);
        setError("");
        delay = PROGRESS_POLL_MS;
        failures = 0;
        if (isFinalStatus(record.status)) return;
      } catch (reason) {
        if (controller.signal.aborted) return;
        setError(getApiErrorMessage(reason, MSG.progressRetry));
        if (isAxiosError(reason) && [400, 401, 403, 404].includes(reason.response?.status ?? 0)) {
          setPaused(true);
          return;
        }
        delay = Math.min(PROGRESS_POLL_MS * 2 ** Math.min(failures++, 2), PROGRESS_POLL_MAX_MS);
      }
      schedule();
    };

    void poll();
    return () => {
      controller.abort();
      clearTimeout(timer);
      setPaused(false);
    };
  }, [submissionId, round]);

  const resume = useCallback(() => setRound((value) => value + 1), []);

  // GBR-63: xử lý lại từ bước bị lỗi; MSG-24
  const retry = useCallback(async () => {
    if (!submissionId || retrying) return;
    setRetrying(true);
    try {
      const response = await practiceSubmissionApi.retry(submissionId);
      setSubmission(response.data.data);
      toast.info(MSG.retrying);
      setRound((value) => value + 1);
    } catch (reason) {
      toast.error(getApiErrorMessage(reason, MSG.retryFailed));
    } finally {
      setRetrying(false);
    }
  }, [submissionId, retrying]);

  return { submission, error, paused, retrying, resume, retry };
}
