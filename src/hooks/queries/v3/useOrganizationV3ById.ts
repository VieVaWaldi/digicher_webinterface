import { useQuery } from "@tanstack/react-query";
import { createApiFetcher } from "hooks/queries/createQuery";

export interface RorLocation {
  geonames_id: number | null;
  geonames_details: {
    continent_code: string | null;
    continent_name: string | null;
    country_code: string | null;
    country_name: string | null;
    country_subdivision_code: string | null;
    country_subdivision_name: string | null;
    lat: number | null;
    lng: number | null;
    name: string | null;
  } | null;
}

export interface OrganizationV3 {
  id: string;
  legalName: string | null;
  legalShortName: string | null;
  countryCode: string | null;
  rorTypes: string[] | null;
  rorLocations: RorLocation[] | null;
  geolocation: string[] | null;
}

export const useOrganizationV3ById = (id: string | null) => {
  const endpoint = `/api/v3/organization/${id}`;
  const fetcher = createApiFetcher<OrganizationV3>(endpoint);

  return useQuery<OrganizationV3>({
    queryKey: ["organization-v3", id],
    queryFn: fetcher,
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};
