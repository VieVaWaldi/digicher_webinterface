import { useQuery } from "@tanstack/react-query";
import { createApiFetcher } from "hooks/queries/createQuery";

export interface ProjectV3 {
  id: string;
  title: string | null;
  acronym: string | null;
  startDate: string | null;
  endDate: string | null;
  summary: string | null;
  keywords: string | null;
  frameworkProgrammes: string[] | null;
  granted: { currency: string | null; totalCost: number | null; fundedAmount: number | null } | null;
  fundings: { shortName: string; name: string; jurisdiction: string; fundingStream: string }[] | null;
  subjects: string[] | null;
  is_ch: boolean | null;
  pred: number | null;
}

export const useProjectV3ById = (id: string | null) => {
  const endpoint = `/api/v3/project/${id}`;
  const fetcher = createApiFetcher<ProjectV3>(endpoint);

  return useQuery<ProjectV3>({
    queryKey: ["project-v3", id],
    queryFn: fetcher,
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};
