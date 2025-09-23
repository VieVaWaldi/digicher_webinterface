import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ResearchOutputType } from "db/schemas/core";
import { createApiFetcher } from "hooks/queries/createQuery";

export const useResearchoutputbyId = (
  id: string,
  options?: Partial<UseQueryOptions<ResearchOutputType>>,
) => {
  const endpoint = `/api/researchoutput/${id}`;
  const queryKey = ["researchoutput", id];
  const fetcher = createApiFetcher<ResearchOutputType>(endpoint);

  return useQuery<ResearchOutputType>({
    queryKey,
    queryFn: fetcher,
    ...options,
  });
};
