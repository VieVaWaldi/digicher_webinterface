import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ProjectsByInstitutionResponse } from "app/api/project/byInstitution/route";
import { createApiFetcher } from "hooks/queries/createQuery";

interface UseProjectsByInstitutionParams {
  institutionId: string;
  limit?: number;
  offset?: number;
}

export const useProjectsByInstitution = (
  params: UseProjectsByInstitutionParams,
  options?: Partial<UseQueryOptions<ProjectsByInstitutionResponse>>,
) => {
  const { institutionId, limit = 10, offset = 0 } = params;

  const searchParams = new URLSearchParams({
    institution_id: institutionId,
    limit: limit.toString(),
    offset: offset.toString(),
  });

  const endpoint = `/api/project/byInstitution?${searchParams.toString()}`;
  const queryKey = ["projectsByInstitution", institutionId, limit, offset];
  const fetcher = createApiFetcher<ProjectsByInstitutionResponse>(endpoint);

  return useQuery<ProjectsByInstitutionResponse>({
    queryKey,
    queryFn: fetcher,
    enabled: !!institutionId,
    ...options,
  });
};
