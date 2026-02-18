import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { TopicOAType } from "db/schemas/core";
import { createApiFetcher } from "hooks/queries/createQuery";

export const useTopicByProjectId = (
  id: string,
  options?: Partial<UseQueryOptions<TopicOAType>>,
) => {
  const endpoint = `/api/project/${id}/topic`;
  const queryKey = ["project-topic", id];
  const fetcher = createApiFetcher<TopicOAType>(endpoint);

  return useQuery<TopicOAType>({
    queryKey,
    queryFn: fetcher,
    ...options,
  });
};
