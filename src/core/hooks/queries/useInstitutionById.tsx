import { Institution } from "datamodel/institution/types";
import { useFetch } from "../useFetch";

export function useInstitutionById(id: number) {
  return useFetch<Institution>("/api/institution_by_id", {
    enabled: id >= 0,
    params: { institution_id: id },
  });
}
