import { useQuery } from "@tanstack/react-query";
import { InstitutionSearchParams } from "app/api/views/table/institution/route";
import { createApiFetcher } from "hooks/queries/createQuery";

interface InstitutionTableItem {
  id: string;
  legal_name: string | null;
  short_name: string | null;
  country_code: string | null;
  country_label: string | null;
  city: string | null;
  type_title: string | null;
  sme: boolean | null;
}

interface InstitutionTableResponse {
  data: InstitutionTableItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: InstitutionSearchParams;
}

function buildQueryString(params: InstitutionSearchParams): string {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.append("search", params.search);
  if (params.countries?.length)
    searchParams.append("countries", params.countries.join(","));
  if (params.types?.length)
    searchParams.append("types", params.types.join(","));
  if (params.sme) searchParams.append("sme", "true");
  if (params.page !== undefined)
    searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.sortBy) searchParams.append("sortBy", params.sortBy);
  if (params.sortOrder) searchParams.append("sortOrder", params.sortOrder);

  return searchParams.toString();
}

export const useTableViewInstitution = (
  params: InstitutionSearchParams = {},
  enabled: boolean = true,
) => {
  const queryString = buildQueryString(params);
  const endpoint = `/api/views/table/institution${queryString ? `?${queryString}` : ""}`;

  const queryKey = [
    "table-view-institution",
    params.search,
    params.countries?.sort().join(","),
    params.types?.sort().join(","),
    params.sme,
    params.page,
    params.limit,
    params.sortBy,
    params.sortOrder,
  ].filter((v) => v !== undefined);

  const fetcher = createApiFetcher<InstitutionTableResponse>(endpoint);

  return useQuery<InstitutionTableResponse>({
    queryKey,
    queryFn: fetcher,
    enabled,
    staleTime: 1000 * 60 * 5,
  });
};

export type { InstitutionTableItem, InstitutionTableResponse };
