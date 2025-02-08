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

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  queryParams: string;
}

// Cache manager to handle in-memory storage
class CacheManager {
  private static instance: CacheManager | null = null;
  private cache: Map<string, CacheEntry<unknown>>;
  private readonly CACHE_DURATION: number = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

  private constructor() {
    this.cache = new Map();
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  public set<T>(key: string, data: T, queryParams: string): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      queryParams,
    });
  }

  public get<T>(key: string, queryParams: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) return null;

    // Check if the query params match
    if (entry.queryParams !== queryParams) return null;

    // Check if the cache has expired
    if (Date.now() - entry.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  public clear(): void {
    this.cache.clear();
  }
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

        const response = await fetch(`${route}${queryParams}`);

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

// Export cache manager functions
export const clearCache = (): void => {
  CacheManager.getInstance().clear();
};
