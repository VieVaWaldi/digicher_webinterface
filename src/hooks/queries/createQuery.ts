import { useQuery, UseQueryOptions } from "@tanstack/react-query";

// In the Provider ?
// const defaultQueryOptions = {
//   staleTime: 1000 * 60 * 5,
//   retry: 2,
//   refetchOnWindowFocus: false,
// };

export function createApiFetcher<T>(endpoint: string) {
  return async (): Promise<T> => {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
    }
    return response.json();
  };
}

export function createQueryHook<T>(
  queryKey: string[],
  endpoint: string,
  options?: Partial<UseQueryOptions<T>>,
) {
  const fetcher = createApiFetcher<T>(endpoint);

  return function useCustomQuery() {
    return useQuery<T>({
      queryKey,
      queryFn: fetcher,
      //   ...defaultQueryOptions,
      ...options,
    });
  };
}

export function createParameterizedQueryHook<
  T,
  TParams extends readonly unknown[],
>(
  keyFactory: (...params: TParams) => string[],
  endpointFactory: (...params: TParams) => string,
) {
  return (...params: TParams) => {
    const endpoint = endpointFactory(...params);
    const queryKey = keyFactory(...params);
    const fetcher = createApiFetcher<T>(endpoint);

    return useQuery<T>({
      queryKey,
      queryFn: fetcher,
    });
  };
}
