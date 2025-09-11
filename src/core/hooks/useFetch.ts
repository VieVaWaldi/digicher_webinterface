import { useEffect, useState } from "react";

import { CacheManager } from "../caching/CacheManager";

interface FetchState<T> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
}

interface FetchOptions {
  enabled?: boolean;
  params?: Record<string, string | number>;
}

/**
 * Custom hook for fetching data with caching support
 * @param route - The API endpoint to fetch from
 * @param options - Optional configuration for the fetch request
 * @returns FetchState containing the data, loading state, and any errors
 */
export function useFetch<T>(
  route: string,
  options: FetchOptions = {},
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

    const cacheManager = CacheManager.getInstance();

    async function fetchData() {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const queryParams = options.params
          ? "?" +
            new URLSearchParams(
              Object.entries(options.params).map(([k, v]) => [k, String(v)]),
            ).toString()
          : "";

        // Check cache first
        const cachedData = cacheManager.get<T>(route, queryParams);
        if (cachedData !== null) {
          setState({
            data: cachedData,
            loading: false,
            error: null,
          });
          return;
        }
        if (route == "/api/scenario_points/project_coordinator_points") {
          console.log(`${route}${queryParams}`);
        }

        const response = await fetch(`${route}${queryParams}`);
        if (route == "/api/scenario_points/project_coordinator_points") {
          console.log(response);
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = (await response.json()) as T;

        // Store in cache
        cacheManager.set<T>(route, data, queryParams);

        setState({
          data,
          loading: false,
          error: null,
        });
      } catch (err) {
        setState({
          data: undefined,
          loading: false,
          error:
            err instanceof Error ? err.message : "An unknown error occurred",
        });
      }
    }

    void fetchData();
    // Using [route, options.enabled, options.params] directly leads to infinite reloading
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route, JSON.stringify(options)]);

  return state;
}
