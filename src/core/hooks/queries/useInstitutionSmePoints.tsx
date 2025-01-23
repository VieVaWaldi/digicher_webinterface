import { InstitutionSmePoint } from "datamodel/institution/types";
import { useFetch } from "../useFetch";

export function useInstitutionSmePoints() {
  return useFetch<InstitutionSmePoint[]>("/api/institution_sme_points");
}
