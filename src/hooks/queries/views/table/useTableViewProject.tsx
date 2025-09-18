import { useQuery } from "@tanstack/react-query";
import { ProjectSearchParams } from "app/api/views/table/project/route";
import { createApiFetcher } from "hooks/queries/createQuery";

interface ProjectTableItem {
  id: string;
  title: string;
  start_date: string;
  acronym: string;
  rank?: number;
}

interface ProjectTableResponse {
  data: ProjectTableItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: ProjectSearchParams;
}

function buildQueryString(params: ProjectSearchParams): string {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.append("search", params.search);
  if (params.minYear) searchParams.append("minYear", params.minYear.toString());
  if (params.maxYear) searchParams.append("maxYear", params.maxYear.toString());

  if (params.topicIds?.length) {
    searchParams.append("topicIds", params.topicIds.join(","));
  }
  if (params.subfieldIds?.length) {
    searchParams.append("subfieldIds", params.subfieldIds.join(","));
  }
  if (params.fieldIds?.length) {
    searchParams.append("fieldIds", params.fieldIds.join(","));
  }
  if (params.domainIds?.length) {
    searchParams.append("domainIds", params.domainIds.join(","));
  }

  if (params.frameworkProgrammes?.length) {
    searchParams.append(
      "frameworkProgrammes",
      params.frameworkProgrammes.join(","),
    );
  }

  if (params.page !== undefined)
    searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.sortBy) searchParams.append("sortBy", params.sortBy);
  if (params.sortOrder) searchParams.append("sortOrder", params.sortOrder);

  return searchParams.toString();
}

export const useTableViewProject = (
  params: ProjectSearchParams = {},
  enabled: boolean = true,
) => {
  const queryString = buildQueryString(params);
  const endpoint = `/api/views/table/project${queryString ? `?${queryString}` : ""}`;

  const queryKey = [
    "table-view-project",
    params.search,
    params.minYear,
    params.maxYear,
    params.topicIds?.sort().join(","),
    params.subfieldIds?.sort().join(","),
    params.fieldIds?.sort().join(","),
    params.domainIds?.sort().join(","),
    params.frameworkProgrammes?.sort().join(","),
    params.page,
    params.limit,
    params.sortBy,
    params.sortOrder,
  ].filter(Boolean);

  const fetcher = createApiFetcher<ProjectTableResponse>(endpoint);

  return useQuery<ProjectTableResponse>({
    queryKey,
    queryFn: fetcher,
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export type { ProjectTableItem, ProjectTableResponse };
