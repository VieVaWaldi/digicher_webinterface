import { useFetch } from "core/hooks/useFetch";
import { InstitutionSearchResult } from "datamodel/institution/types";

export function useInstitutionsByName(name: string) {
  return useFetch<InstitutionSearchResult[]>(
    "/api/institution/institutions_by_name",
    {
      enabled: name != null && name.length != 0,
      params: { name: name },
    },
  );
}
