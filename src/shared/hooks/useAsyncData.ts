import { useCallback, useEffect, useRef, useState } from "react";
import { getApiErrorMessage } from "@/shared/utils/getApiErrorMessage";

interface LoadedData<T> {
  requestKey: string;
  data: T | null;
  error: string | null;
}

export function useAsyncData<T>(load: () => Promise<T>, dependencyKey: string, fallbackError: string) {
  const [reloadCount, setReloadCount] = useState(0);
  const [loaded, setLoaded] = useState<LoadedData<T> | null>(null);
  const loadRef = useRef(load);
  const requestKey = `${dependencyKey}#${reloadCount}`;

  useEffect(() => {
    loadRef.current = load;
  });

  useEffect(() => {
    let isCancelled = false;
    loadRef
      .current()
      .then((data) => {
        if (!isCancelled) setLoaded({ requestKey, data, error: null });
      })
      .catch((error: unknown) => {
        if (!isCancelled) setLoaded({ requestKey, data: null, error: getApiErrorMessage(error, fallbackError) });
      });
    return () => {
      isCancelled = true;
    };
  }, [requestKey, fallbackError]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  return {
    data: loaded?.data ?? null,
    error: loaded?.error ?? null,
    isLoading: loaded?.requestKey !== requestKey,
    reload,
  };
}
