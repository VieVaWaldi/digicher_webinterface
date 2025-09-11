import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { InstitutionType } from "db/schema";
import { createApiFetcher } from "hooks/queries/createQuery";

export const useInstitutionById = (
  id: string,
  options?: Partial<UseQueryOptions<InstitutionType>>,
) => {
  const endpoint = `/api/institution/${id}`;
  const queryKey = ["institution", id];
  const fetcher = createApiFetcher<InstitutionType>(endpoint);

  return useQuery<InstitutionType>({
    queryKey,
    queryFn: fetcher,
    ...options,
  });
};
