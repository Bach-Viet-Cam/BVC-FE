import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

interface AsyncState<T> {
  key: string;
  data: T | null;
  error: string | null;
}

interface AsyncDataOptions {
  // Màn chỉ xem: quay lại màn đã mở thì hiện ngay dữ liệu lần trước rồi tải lại ngầm.
  // Không bật cho form sửa, vì form lấy dữ liệu đầu tiên làm giá trị mặc định.
  cache?: boolean;
}

const CACHE_LIMIT = 100;
const cache = new Map<string, unknown>();

function remember(key: string, data: unknown) {
  cache.delete(key);
  cache.set(key, data);
  if (cache.size > CACHE_LIMIT) cache.delete(cache.keys().next().value as string);
}

// Gọi khi đổi tài khoản để người sau không thấy dữ liệu của người trước
export function clearAsyncDataCache() {
  cache.clear();
}

/**
 * Gọi fetcher mỗi khi `key` đổi. Giữ data cũ trong lúc tải lại để danh sách không nháy;
 * `isLoading` suy ra từ việc kết quả hiện có thuộc về key nào.
 * `fallbackError` dùng khi lỗi không mang message từ BE.
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  key: string,
  fallbackError?: string,
  options: AsyncDataOptions = {}
) {
  const useCache = options.cache === true;
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
        if (useCache) remember(key, data);
        if (!cancelled) setState({ key: requestKey, data, error: null });
      },
      (error: unknown) => {
        if (!cancelled) setState({ key: requestKey, data: null, error: getErrorMessage(error, fallbackError) });
      }
    );
    return () => {
      cancelled = true;
    };
  }, [requestKey, fallbackError, useCache, key]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);

  const isLoading = state?.key !== requestKey;
  // Đang tải key mới mà cache có sẵn thì hiện luôn bản cache thay vì skeleton
  const cached = isLoading && useCache && cache.has(key) ? (cache.get(key) as T) : null;
  const data = cached ?? state?.data ?? null;

  const mutate = useCallback(
    (updater: (current: T) => T) => {
      setState((current) => {
        // Dữ liệu đang hiển thị: kết quả của key hiện tại, nếu chưa có thì bản cache của key này
        const fresh = current?.key === requestKey ? current.data : null;
        const fromCache = useCache && cache.has(key) ? (cache.get(key) as T) : null;
        const base = fresh ?? fromCache ?? current?.data ?? null;
        if (base == null) return current;
        const next = updater(base);
        if (useCache) remember(key, next);
        return { key: current?.key ?? "", data: next, error: current?.error ?? null };
      });
    },
    [useCache, key, requestKey]
  );

  return {
    data,
    error: isLoading ? null : (state?.error ?? null),
    isLoading,
    isFirstLoad: isLoading && data === null,
    reload,
    mutate,
  };
}
