import { useQuery } from "@tanstack/react-query";
import { createApiFetcher } from "hooks/queries/createQuery";

export interface WorkV3 {
  id: string;
  title: string | null;
  publicationDate: string | null;
  publisher: string | null;
  openAccessColor: string | null;
  descriptions: string[] | null;
  pids: { scheme: string; value: string }[] | null;
  instances: { type: string | null; license: string | null; accessRight: { code: string; label: string } | null }[] | null;
  citationCount: number | null;
  container: { name: string | null; issnPrinted: string | null; issnOnline: string | null } | null;
  language: { code: string | null; label: string | null } | null;
  influence: number | null;
}

export const useWorkV3ById = (id: string | null) => {
  const endpoint = `/api/v3/work/${id}`;
  const fetcher = createApiFetcher<WorkV3>(endpoint);

  return useQuery<WorkV3>({
    queryKey: ["work-v3", id],
    queryFn: fetcher,
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};
