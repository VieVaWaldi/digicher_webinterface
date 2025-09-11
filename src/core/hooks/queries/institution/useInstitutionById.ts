import { useFetch } from "core/hooks/useFetch";
import { Institution } from "datamodel/institution/types";

export function useInstitutionById(id: string) {
  return useFetch<Institution>("/api/institution/institution_by_id", {
    enabled: id != "",
    params: { institution_id: id },
  });
}
