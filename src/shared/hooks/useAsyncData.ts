import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

interface AsyncState<T> {
  key: string;
  data: T | null;
  error: string | null;
}

/**
 * Gọi fetcher mỗi khi `key` đổi. Giữ data cũ trong lúc tải lại để danh sách không nháy;
 * `isLoading` suy ra từ việc kết quả hiện có thuộc về key nào.
 * `fallbackError` dùng khi lỗi không mang message từ BE.
 */
export function useAsyncData<T>(fetcher: () => Promise<T>, key: string, fallbackError?: string) {
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
        if (!cancelled) setState({ key: requestKey, data, error: null });
      },
      (error: unknown) => {
        if (!cancelled) setState({ key: requestKey, data: null, error: getErrorMessage(error, fallbackError) });
      }
    );
    return () => {
      cancelled = true;
    };
  }, [requestKey, fallbackError]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);

  const mutate = useCallback((updater: (current: T) => T) => {
    setState((current) => (current?.data == null ? current : { ...current, data: updater(current.data) }));
  }, []);

  const isLoading = state?.key !== requestKey;
  const data = state?.data ?? null;

  return {
    data,
    error: isLoading ? null : (state?.error ?? null),
    isLoading,
    isFirstLoad: isLoading && data === null,
    reload,
    mutate,
  };
}
