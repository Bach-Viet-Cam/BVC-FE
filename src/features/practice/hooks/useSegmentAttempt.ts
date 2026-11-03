import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { practiceSegmentApi } from "@/features/practice/api/practiceSegmentApi";
import { MSG, PROGRESS_POLL_MAX_MS, PROGRESS_POLL_MS } from "@/features/practice/constants/practiceConstants";
import type { SegmentAttempt } from "@/features/practice/types/practiceSegmentTypes";
import { isFinalStatus } from "@/features/practice/utils/submissionStatus";
import { getApiErrorMessage } from "@/shared/utils/getApiErrorMessage";

// Theo dõi một lượt luyện đoạn: hỏi BE định kỳ tới khi có trạng thái cuối; dừng hẳn khi lượt luyện không còn hoặc không có quyền
export function useSegmentAttempt(segmentId: string | null) {
  const [attempt, setAttempt] = useState<SegmentAttempt | null>(null);
  const [error, setError] = useState("");
  const [stopped, setStopped] = useState(false);

  useEffect(() => {
    if (!segmentId) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let delay = PROGRESS_POLL_MS;
    let failures = 0;

    const poll = async () => {
      try {
        const response = await practiceSegmentApi.get(segmentId, controller.signal);
        if (controller.signal.aborted) return;
        const record = response.data.data;
        setAttempt(record);
        setError("");
        delay = PROGRESS_POLL_MS;
        failures = 0;
        if (isFinalStatus(record.status)) {
          setStopped(true);
          return;
        }
      } catch (reason) {
        if (controller.signal.aborted) return;
        setError(getApiErrorMessage(reason, MSG.progressRetry));
        if (isAxiosError(reason) && [400, 401, 403, 404].includes(reason.response?.status ?? 0)) {
          setStopped(true);
          return;
        }
        delay = Math.min(PROGRESS_POLL_MS * 2 ** Math.min(failures++, 2), PROGRESS_POLL_MAX_MS);
      }
      timer = setTimeout(() => void poll(), delay);
    };

    void poll();
    return () => {
      controller.abort();
      clearTimeout(timer);
      setAttempt(null);
      setError("");
      setStopped(false);
    };
  }, [segmentId]);

  return { attempt, error, stopped };
}
