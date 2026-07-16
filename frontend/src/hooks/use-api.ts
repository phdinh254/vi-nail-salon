"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api-client";

export type ApiState<T> = {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
};

/**
 * `deps` re-runs the fetch when values change (e.g. a filter or an id).
 * Pass `enabled: false` to skip fetching (e.g. while auth is still hydrating).
 */
export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList = [],
  options: { enabled?: boolean } = {},
): ApiState<T> {
  const enabled = options.enabled ?? true;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function run() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetcherRef.current();
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Đã có lỗi xảy ra. Vui lòng thử lại.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, reloadKey, ...deps]);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  return { data, isLoading, error, refetch };
}
