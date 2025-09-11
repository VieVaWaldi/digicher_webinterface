import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { InstitutionSearchResult } from "app/api/institution/search/route";
import { createApiFetcher } from "hooks/queries/createQuery";

export const useInstitutionSearchByName = (
  name: string,
  options?: Partial<UseQueryOptions<InstitutionSearchResult[]>>,
) => {
  const endpoint = `/api/institution/search?q=${name}`;
  const queryKey = ["institution", name];
  const fetcher = createApiFetcher<InstitutionSearchResult[]>(endpoint);

  return useQuery<InstitutionSearchResult[]>({
    queryKey,
    queryFn: fetcher,
    ...options,
  });
};
