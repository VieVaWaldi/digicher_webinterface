import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ProjectSearchResult } from "app/api/project/search/route";
import { createApiFetcher } from "hooks/queries/createQuery";

export const useProjectSearchByName = (
  name: string,
  options?: Partial<UseQueryOptions<ProjectSearchResult[]>>,
) => {
  const endpoint = `/api/project/search?q=${name}`;
  const queryKey = ["project", name];
  const fetcher = createApiFetcher<ProjectSearchResult[]>(endpoint);

  return useQuery<ProjectSearchResult[]>({
    queryKey,
    queryFn: fetcher,
    ...options,
  });
};
