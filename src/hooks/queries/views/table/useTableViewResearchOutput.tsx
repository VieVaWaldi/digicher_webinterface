import { useQuery } from "@tanstack/react-query";
import { ResearchOutputSearchParams } from "app/api/views/table/researchoutput/route";
import { createApiFetcher } from "hooks/queries/createQuery";

interface ResearchOutputTableItem {
  id: string;
  title: string;
  publication_date: string;
  doi: string;
  rank?: number;
}

interface ResearchOutputTableResponse {
  data: ResearchOutputTableItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: ResearchOutputSearchParams;
}

function buildQueryString(params: ResearchOutputSearchParams): string {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.append("search", params.search);
  if (params.minYear) searchParams.append("minYear", params.minYear.toString());
  if (params.maxYear) searchParams.append("maxYear", params.maxYear.toString());

  if (params.page !== undefined)
    searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.sortBy) searchParams.append("sortBy", params.sortBy);
  if (params.sortOrder) searchParams.append("sortOrder", params.sortOrder);

  return searchParams.toString();
}

export const useTableViewResearchOutput = (
  params: ResearchOutputSearchParams = {},
  enabled: boolean = true,
) => {
  const queryString = buildQueryString(params);
  const endpoint = `/api/views/table/researchoutput${queryString ? `?${queryString}` : ""}`;

  const queryKey = [
    "table-view-researchoutput",
    params.search,
    params.minYear,
    params.maxYear,
    params.page,
    params.limit,
    params.sortBy,
    params.sortOrder,
  ].filter(Boolean);

  const fetcher = createApiFetcher<ResearchOutputTableResponse>(endpoint);

  return useQuery<ResearchOutputTableResponse>({
    queryKey,
    queryFn: fetcher,
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export type { ResearchOutputTableItem, ResearchOutputTableResponse };
