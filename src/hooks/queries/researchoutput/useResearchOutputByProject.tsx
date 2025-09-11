import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ResearchOutputItem } from "app/api/researchoutput/byProject/route";
import { createApiFetcher } from "hooks/queries/createQuery";

type ResearchOutputByProjectResponse = ResearchOutputItem[];

interface UseResearchOutputByProjectParams {
  projectId: string;
  limit?: number;
  offset?: number;
}

export const useResearchOutputByProject = (
  params: UseResearchOutputByProjectParams,
  options?: Partial<UseQueryOptions<ResearchOutputByProjectResponse>>,
) => {
  const { projectId, limit = 10, offset = 0 } = params;

  const searchParams = new URLSearchParams({
    project_id: projectId,
    limit: limit.toString(),
    offset: offset.toString(),
  });

  const endpoint = `/api/researchoutput/byProject?${searchParams.toString()}`;
  const queryKey = ["researchOutputByProject", projectId, limit, offset];
  const fetcher = createApiFetcher<ResearchOutputByProjectResponse>(endpoint);

  return useQuery<ResearchOutputByProjectResponse>({
    queryKey,
    queryFn: fetcher,
    enabled: !!projectId,
    ...options,
  });
};
