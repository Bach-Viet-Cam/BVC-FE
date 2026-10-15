import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

interface AsyncState<T> {
  key: string;
  data?: T;
  error?: string;
}

/**
 * Gọi fetcher mỗi khi `key` đổi. Giữ data cũ trong lúc tải lại để danh sách không nháy;
 * `isLoading` suy ra từ việc kết quả hiện có thuộc về key nào.
 */
export function useAsyncData<T>(fetcher: () => Promise<T>, key: string) {
  const [state, setState] = useState<AsyncState<T> | null>(null);
  const [version, setVersion] = useState(0);
  const fetcherRef = useRef(fetcher);
  const requestKey = `${key}#${version}`;

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    let cancelled = false;
    fetcherRef.current().then(
      (data) => {
        if (!cancelled) setState({ key: requestKey, data });
      },
      (error: unknown) => {
        if (!cancelled) setState({ key: requestKey, error: getErrorMessage(error) });
      }
    );
    return () => {
      cancelled = true;
    };
  }, [requestKey]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);

  const mutate = useCallback((updater: (current: T) => T) => {
    setState((current) => (current?.data === undefined ? current : { ...current, data: updater(current.data) }));
  }, []);

  const isLoading = state?.key !== requestKey;

  return {
    data: state?.data,
    error: isLoading ? undefined : state?.error,
    isLoading,
    isFirstLoad: isLoading && state?.data === undefined,
    reload,
    mutate,
  };
}
