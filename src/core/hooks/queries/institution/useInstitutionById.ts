import { useFetch } from "core/hooks/useFetch";
import { Institution } from "datamodel/institution/types";

export function useInstitutionById(id: number) {
  return useFetch<Institution>("/api/institution/institution_by_id", {
    enabled: id >= 0,
    params: { institution_id: id },
  });
}
