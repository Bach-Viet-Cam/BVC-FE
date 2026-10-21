import { useCallback, useEffect, useRef, useState } from "react";

interface QueryState<T> {
  key: string | null;
  data: T | null;
  error: unknown;
}

// Loads data whenever requestKey changes. Loading is derived (the last settled key differs
// from the current one), so no state is set synchronously inside the effect.
export function useApiQuery<T>(requestKey: string | null, fetcher: () => Promise<T>) {
  const [reloadCount, setReloadCount] = useState(0);
  const [state, setState] = useState<QueryState<T>>({ key: null, data: null, error: null });
  const fetcherRef = useRef(fetcher);
  const effectiveKey = requestKey === null ? null : `${requestKey}#${reloadCount}`;

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    if (effectiveKey === null) return;
    let isCancelled = false;
    fetcherRef
      .current()
      .then((data) => {
        if (!isCancelled) setState({ key: effectiveKey, data, error: null });
      })
      .catch((error: unknown) => {
        if (!isCancelled) setState((previous) => ({ key: effectiveKey, data: previous.data, error }));
      });
    return () => {
      isCancelled = true;
    };
  }, [effectiveKey]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);
  const setData = useCallback((data: T) => setState((previous) => ({ ...previous, data })), []);

  return {
    data: state.data,
    error: state.key === effectiveKey ? state.error : null,
    isLoading: effectiveKey !== null && state.key !== effectiveKey,
    reload,
    setData,
  };
}
