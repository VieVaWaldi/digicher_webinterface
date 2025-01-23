import { useState, useEffect } from "react";

interface FetchState<T> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
}

interface FetchOptions {
  enabled?: boolean;
  params?: Record<string, string | number>;
}

export function useFetch<T>(
  route: string,
  options: FetchOptions = {}
): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: undefined,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (options.enabled === false) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    async function fetchData() {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const queryParams = options.params
          ? "?" +
            new URLSearchParams(
              Object.entries(options.params).map(([k, v]) => [k, String(v)])
            ).toString()
          : "";

        const response = await fetch(`${route}${queryParams}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setState({ data, loading: false, error: null });
      } catch (err) {
        setState({
          data: undefined,
          loading: false,
          error: err instanceof Error ? err.message : "An error occured",
        });
      }
    }

    fetchData();
  }, [route, JSON.stringify(options)]);

  return state;
}
