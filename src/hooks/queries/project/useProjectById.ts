import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ProjectType } from "db/schema";
import { createApiFetcher } from "hooks/queries/createQuery";

export const useProjectbyId = (
  id: string,
  options?: Partial<UseQueryOptions<ProjectType>>,
) => {
  const endpoint = `/api/project/${id}`;
  const queryKey = ["project", id];
  const fetcher = createApiFetcher<ProjectType>(endpoint);

  return useQuery<ProjectType>({
    queryKey,
    queryFn: fetcher,
    ...options,
  });
};
