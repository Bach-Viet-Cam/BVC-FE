import { useCallback, useEffect, useState } from "react";
import type { AxiosResponse } from "axios";
import { getApiErrorMessage } from "@/shared/utils/getApiErrorMessage";
import type { ApiResponse } from "@/shared/types/commonTypes";

type ResultFetcher<T> = (id: string, signal?: AbortSignal) => Promise<AxiosResponse<ApiResponse<T>>>;

export interface ResultPartState<T> {
  data: T | null;
  loading: boolean;
  error: string;
  reload: () => void;
}

interface Settled<T> {
  requestKey: string;
  data: T | null;
  error: string;
}

// Tải một phần của màn Kết quả. Mỗi thẻ gọi riêng nên một phần lỗi không làm trống cả màn hình.
// enabled = false: chưa gọi (ví dụ bài chưa phân tích xong, hoặc luyện tự do thì không có xếp hạng lớp).
// Đang tải = yêu cầu hiện tại chưa có kết quả, nên không cần đặt state ngay trong effect.
export function useResultPart<T>(
  fetcher: ResultFetcher<T>,
  submissionId: string,
  enabled: boolean,
  fallbackError: string
): ResultPartState<T> {
  const [round, setRound] = useState(0);
  const [settled, setSettled] = useState<Settled<T>>({ requestKey: "", data: null, error: "" });
  const requestKey = `${submissionId}:${round}`;
  const isActive = enabled && Boolean(submissionId);

  useEffect(() => {
    if (!isActive) return;
    const controller = new AbortController();
    fetcher(submissionId, controller.signal)
      .then((response) => {
        if (!controller.signal.aborted) setSettled({ requestKey, data: response.data.data, error: "" });
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setSettled({ requestKey, data: null, error: getApiErrorMessage(reason, fallbackError) });
        }
      });
    return () => controller.abort();
  }, [fetcher, submissionId, isActive, fallbackError, requestKey]);

  const reload = useCallback(() => setRound((value) => value + 1), []);
  const isCurrent = settled.requestKey === requestKey;
  return {
    data: isActive && isCurrent ? settled.data : null,
    loading: isActive && !isCurrent,
    error: isActive && isCurrent ? settled.error : "",
    reload,
  };
}
